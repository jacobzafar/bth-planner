import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, User, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SettingsPageProps {
  programName: string;
  startYear: number;
  onLogout: () => void;
}

export default function SettingsPage({ programName, startYear, onLogout }: SettingsPageProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;
      toast({ title: 'Kontot har raderats' });
      await supabase.auth.signOut();
      onLogout();
    } catch (e) {
      toast({
        title: 'Kunde inte radera kontot',
        description: (e as Error).message,
        variant: 'destructive',
      });
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto md:mt-12 animate-slide-up space-y-4">
      <h1 className="font-heading text-2xl font-bold text-foreground">Inställningar</h1>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <User className="h-4 w-4" /> Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Program</span>
            <span className="text-sm text-foreground font-medium text-right max-w-[250px] truncate">{programName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Startår</span>
            <span className="text-sm text-foreground">{startYear}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <Button variant="outline" onClick={onLogout} className="w-full gap-2">
            <LogOut className="h-4 w-4" /> Logga ut
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full gap-2" disabled={deleting}>
                <Trash2 className="h-4 w-4" /> {deleting ? 'Raderar...' : 'Radera konto'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Radera kontot permanent?</AlertDialogTitle>
                <AlertDialogDescription>
                  Detta tar bort ditt konto och all tillhörande data (kurser, uppgifter och kalenderhändelser). Åtgärden kan inte ångras.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Ja, radera
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
