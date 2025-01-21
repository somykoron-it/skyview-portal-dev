import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ReleaseNote {
  id: string;
  version: string;
  title: string;
  description: string;
  release_date: string;
}

export function ReleaseNotePopup() {
  const [open, setOpen] = useState(false);
  const [latestNote, setLatestNote] = useState<ReleaseNote | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkReleaseNotes = async () => {
      try {
        // Get the current user's session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          return;
        }
        
        if (!session) {
          console.log('No active session, skipping release notes check');
          return;
        }

        // Get all viewed release note IDs from localStorage
        const viewedNotesString = localStorage.getItem('viewedReleaseNotes');
        const viewedNotes: string[] = viewedNotesString ? JSON.parse(viewedNotesString) : [];
        console.log('Previously viewed release notes:', viewedNotes);

        // Get the latest release note with retries
        let attempts = 0;
        const maxAttempts = 3;
        let notes = null;
        let error = null;

        while (attempts < maxAttempts && !notes) {
          try {
            console.log(`Attempting to fetch release notes (attempt ${attempts + 1}/${maxAttempts})`);
            const response = await supabase
              .from('release_notes')
              .select('*')
              .order('release_date', { ascending: false })
              .limit(1);

            if (response.error) {
              throw response.error;
            }

            notes = response.data;
            break;
          } catch (e) {
            error = e;
            attempts++;
            if (attempts < maxAttempts) {
              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
            }
          }
        }

        if (error || !notes) {
          console.error('Failed to fetch release notes after all attempts:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to check for new releases. Please try again later.",
          });
          return;
        }

        if (notes && notes.length > 0) {
          const latestReleaseNote = notes[0];
          console.log('Latest release note:', latestReleaseNote.id);
          
          // Check if we've already shown this note
          const hasBeenViewed = viewedNotes.includes(latestReleaseNote.id);
          console.log('Has this note been viewed?', hasBeenViewed);

          // Only show if not viewed and is a recent note (within last 30 days)
          const releaseDate = new Date(latestReleaseNote.release_date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          if (!hasBeenViewed && releaseDate >= thirtyDaysAgo) {
            console.log('Showing release note popup for:', latestReleaseNote.title);
            setLatestNote(latestReleaseNote);
            setOpen(true);
          } else {
            console.log('Release note already viewed or too old:', latestReleaseNote.id);
          }
        }
      } catch (error) {
        console.error('Error in checkReleaseNotes:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to check for new releases. Please try again later.",
        });
      }
    };

    // Only check release notes once when component mounts
    checkReleaseNotes();
  }, []); // Empty dependency array ensures this only runs once

  const handleClose = () => {
    if (latestNote) {
      // Get existing viewed notes
      const viewedNotesString = localStorage.getItem('viewedReleaseNotes');
      const viewedNotes: string[] = viewedNotesString ? JSON.parse(viewedNotesString) : [];
      
      // Add the new note ID if it's not already in the array
      if (!viewedNotes.includes(latestNote.id)) {
        viewedNotes.push(latestNote.id);
        // Store the updated array back in localStorage
        localStorage.setItem('viewedReleaseNotes', JSON.stringify(viewedNotes));
        console.log('Updated viewed release notes:', viewedNotes);
      }
    }
    setOpen(false);
  };

  if (!latestNote) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {latestNote.title}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Version {latestNote.version} • Released {format(new Date(latestNote.release_date), 'MMMM d, yyyy')}
          </div>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="prose prose-sm dark:prose-invert">
            {latestNote.description}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Got it</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}