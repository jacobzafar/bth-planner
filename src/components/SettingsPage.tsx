import { UserData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Hash } from 'lucide-react';

interface SettingsPageProps {
  userData: UserData;
  onLogout: () => void;
}

export default function SettingsPage({ userData, onLogout }: SettingsPageProps) {
  return (
    <div className="max-w-lg mx-auto md:mt-12 animate-slide-up space-y-4">
      <h1 className="font-heading text-2xl font-bold text-foreground">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Planning ID</span>
            <Badge variant="secondary" className="font-mono">{userData.planningId}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Program</span>
            <span className="text-sm text-foreground font-medium text-right max-w-[200px] truncate">{userData.programName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Courses</span>
            <span className="text-sm text-foreground">{userData.courses.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Events</span>
            <span className="text-sm text-foreground">{userData.events.length}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button variant="destructive" onClick={onLogout} className="w-full gap-2">
            <LogOut className="h-4 w-4" /> Reset & Start Over
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">This will clear all your data</p>
        </CardContent>
      </Card>
    </div>
  );
}
