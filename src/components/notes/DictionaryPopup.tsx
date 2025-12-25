import { useEffect } from "react";
import { useDictionary } from "@/hooks/useDictionary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Volume2, BookOpen, Loader2 } from "lucide-react";

interface DictionaryPopupProps {
  word: string;
  onClose: () => void;
}

export const DictionaryPopup = ({ word, onClose }: DictionaryPopupProps) => {
  const { result, isLoading, error, lookupWord } = useDictionary();

  useEffect(() => {
    lookupWord(word);
  }, [word, lookupWord]);

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden shadow-2xl">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Dictionary
          </CardTitle>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[60vh]">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Word Header */}
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{result.word}</h2>
                {result.phonetic && (
                  <span className="text-muted-foreground font-mono">
                    {result.phonetic}
                  </span>
                )}
                {result.phonetics?.find((p) => p.audio) && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      const audio = result.phonetics?.find((p) => p.audio);
                      if (audio?.audio) playAudio(audio.audio);
                    }}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <Separator />

              {/* Meanings */}
              <div className="space-y-4">
                {result.meanings.map((meaning, idx) => (
                  <div key={idx} className="space-y-2">
                    <Badge variant="secondary" className="capitalize">
                      {meaning.partOfSpeech}
                    </Badge>
                    <ol className="list-decimal list-inside space-y-2 ml-2">
                      {meaning.definitions.slice(0, 3).map((def, defIdx) => (
                        <li key={defIdx} className="text-sm">
                          <span>{def.definition}</span>
                          {def.example && (
                            <p className="mt-1 ml-4 text-muted-foreground italic text-xs">
                              "{def.example}"
                            </p>
                          )}
                        </li>
                      ))}
                    </ol>
                    {meaning.definitions[0]?.synonyms?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs text-muted-foreground">Synonyms:</span>
                        {meaning.definitions[0].synonyms.slice(0, 5).map((syn) => (
                          <Badge key={syn} variant="outline" className="text-xs">
                            {syn}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
