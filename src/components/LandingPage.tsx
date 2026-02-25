import { useState } from 'react';
import { GraduationCap, ChevronRight, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { bthPrograms } from '@/lib/programs';
import { Course } from '@/lib/types';
import heroImage from '@/assets/hero-illustration.jpg';

interface LandingPageProps {
  onSetup: (programName: string, courses: Omit<Course, 'id'>[]) => void;
}

export default function LandingPage({ onSetup }: LandingPageProps) {
  const [step, setStep] = useState<'welcome' | 'select'>('welcome');
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [customCourses, setCustomCourses] = useState<Omit<Course, 'id'>[]>([
    { name: '', code: '', blocking: false, importance: 'medium' },
  ]);
  const [isCustom, setIsCustom] = useState(false);

  const filteredPrograms = bthPrograms.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleStart = () => {
    if (isCustom) {
      const validCourses = customCourses.filter(c => c.name && c.code);
      if (validCourses.length === 0) return;
      onSetup('Custom Program', validCourses);
    } else if (selected !== null) {
      const program = bthPrograms[selected];
      onSetup(program.name, program.courses);
    }
  };

  const addCustomCourse = () => {
    setCustomCourses([...customCourses, { name: '', code: '', blocking: false, importance: 'medium' }]);
  };

  const updateCustomCourse = (i: number, field: string, value: string | boolean) => {
    const updated = [...customCourses];
    (updated[i] as any)[field] = value;
    setCustomCourses(updated);
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="container py-6 flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="font-heading font-bold text-xl text-foreground">BTH Study Planner</span>
        </header>

        <main className="flex-1 container flex flex-col lg:flex-row items-center justify-center gap-12 py-12">
          <div className="max-w-lg animate-slide-up">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              Never miss a <span className="text-accent">deadline</span> again.
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Intelligent course planning and prioritization for BTH students. 
              Know exactly what to focus on next.
            </p>
            <Button size="lg" onClick={() => setStep('select')} className="gap-2 text-base px-8">
              Get Started <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="w-full max-w-md animate-fade-in">
            <img src={heroImage} alt="Study planning illustration" className="w-full rounded-xl shadow-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="container py-6 flex items-center gap-2">
        <GraduationCap className="h-7 w-7 text-primary" />
        <span className="font-heading font-bold text-xl text-foreground">BTH Study Planner</span>
      </header>

      <main className="container max-w-2xl py-8 animate-slide-up">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Choose your program</h2>
        <p className="text-muted-foreground mb-6">Select your BTH program to pre-load courses, or add your own.</p>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 mb-4">
          {filteredPrograms.map((program, i) => {
            const originalIndex = bthPrograms.indexOf(program);
            return (
              <Card
                key={i}
                onClick={() => { setSelected(originalIndex); setIsCustom(false); }}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selected === originalIndex && !isCustom ? 'ring-2 ring-primary bg-secondary' : ''
                }`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">{program.name}</p>
                    <p className="text-xs text-muted-foreground">{program.courses.length} courses pre-loaded</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selected === originalIndex && !isCustom ? 'border-primary bg-primary' : 'border-muted-foreground'
                  }`}>
                    {selected === originalIndex && !isCustom && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Custom entry */}
          <Card
            onClick={() => { setIsCustom(true); setSelected(null); }}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isCustom ? 'ring-2 ring-primary bg-secondary' : ''
            }`}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-foreground">✏️ Custom Manual Entry</p>
                <p className="text-xs text-muted-foreground">Add your own courses manually</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isCustom ? 'border-primary bg-primary' : 'border-muted-foreground'
              }`}>
                {isCustom && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom courses form */}
        {isCustom && (
          <div className="space-y-3 mb-6 animate-slide-up">
            <h3 className="font-heading font-semibold text-foreground">Your courses</h3>
            {customCourses.map((c, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Course code"
                  value={c.code}
                  onChange={(e) => updateCustomCourse(i, 'code', e.target.value)}
                  className="w-32"
                />
                <Input
                  placeholder="Course name"
                  value={c.name}
                  onChange={(e) => updateCustomCourse(i, 'name', e.target.value)}
                  className="flex-1"
                />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addCustomCourse} className="gap-1">
              <Plus className="h-3 w-3" /> Add course
            </Button>
          </div>
        )}

        <Button
          size="lg"
          onClick={handleStart}
          disabled={!isCustom && selected === null}
          className="w-full gap-2 text-base"
        >
          Start Planning <ChevronRight className="h-4 w-4" />
        </Button>
      </main>
    </div>
  );
}
