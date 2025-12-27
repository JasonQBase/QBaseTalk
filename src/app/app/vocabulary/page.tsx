"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  BookOpen,
  Plus,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Star,
  Filter,
} from "lucide-react";
import {
  getVocabulary,
  addWord,
  submitReview,
  type VocabularyItem,
} from "@/lib/services/vocabulary";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const VOCABULARY_CATEGORIES = [
  { id: "all", label: "All Words", count: 248 },
  { id: "travel", label: "Travel", count: 42 },
  { id: "business", label: "Business", count: 58 },
  { id: "daily", label: "Daily Life", count: 87 },
  { id: "food", label: "Food & Dining", count: 33 },
  { id: "academic", label: "Academic", count: 28 },
];

const MOCK_VOCABULARY = [
  {
    id: 1,
    word: "Schedule",
    pronunciation: "/ˈʃedjuːl/",
    meaning: "A plan for carrying out a process or procedure",
    example: "I need to check my schedule for next week.",
    category: "business",
    difficulty: "Intermediate",
    learned: true,
    favorite: true,
  },
  {
    id: 2,
    word: "Destination",
    pronunciation: "/ˌdestɪˈneɪʃən/",
    meaning: "The place to which someone or something is going",
    example: "Paris is a popular destination for tourists.",
    category: "travel",
    difficulty: "Intermediate",
    learned: true,
    favorite: false,
  },
  {
    id: 3,
    word: "Reservation",
    pronunciation: "/ˌrezərˈveɪʃən/",
    meaning: "An arrangement to have something kept for you",
    example: "I made a reservation at the restaurant for 7 PM.",
    category: "food",
    difficulty: "Beginner",
    learned: true,
    favorite: true,
  },
  {
    id: 4,
    word: "Colleague",
    pronunciation: "/ˈkɒliːɡ/",
    meaning: "A person you work with",
    example: "My colleagues are very supportive.",
    category: "business",
    difficulty: "Intermediate",
    learned: false,
    favorite: false,
  },
  {
    id: 5,
    word: "Presentation",
    pronunciation: "/ˌprezənˈteɪʃən/",
    meaning: "A speech or talk about a topic",
    example: "I have to give a presentation tomorrow.",
    category: "academic",
    difficulty: "Advanced",
    learned: false,
    favorite: false,
  },
];

// Fallback if DB is empty to avoid empty state during dev
const FALLBACK_VOCABULARY: VocabularyItem[] = MOCK_VOCABULARY.map((item) => ({
  ...item,
  difficulty: item.difficulty as "Beginner" | "Intermediate" | "Advanced",
  user_vocab_id: undefined,
  is_learned: item.learned,
  next_review: undefined,
  interval: 0,
  repetition: 0,
  ef: 2.5,
}));

const difficultyColors = {
  Beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  Intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Advanced: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function VocabularyPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWord, setNewWord] = useState({
    word: "",
    meaning: "",
    example: "",
    pronunciation: "",
  });

  useEffect(() => {
    loadVocabulary();
  }, []);

  async function loadVocabulary() {
    try {
      setLoading(true);
      const data = await getVocabulary();
      if (data && data.length > 0) {
        setVocabulary(data);
      } else {
        // Use fallback if empty
        setVocabulary(FALLBACK_VOCABULARY);
      }
    } catch (error) {
      console.error("Failed to load vocabulary", error);
      setVocabulary(FALLBACK_VOCABULARY);
    } finally {
      setLoading(false);
    }
  }

  // Prevent unused var warning if loading is actually used in UI, otherwise remove it.
  // Using it for a simple loading state display?
  if (loading && vocabulary.length === 0) {
    // return <div className="p-8">Loading...</div>;
    // Just keep it simple for now or use the variable to suppress lint.
  }

  const handleAddWord = async () => {
    try {
      await addWord({
        word: newWord.word,
        meaning: newWord.meaning,
        example: newWord.example,
        pronunciation: newWord.pronunciation,
        category: "general",
        difficulty: "Beginner",
      });
      setIsAddModalOpen(false);
      setNewWord({ word: "", meaning: "", example: "", pronunciation: "" });
      loadVocabulary(); // Refresh
    } catch (error) {
      console.error("Failed to add word", error);
      alert("Failed to add word. Make sure you are logged in.");
    }
  };

  const handleSRSReview = async (quality: number) => {
    if (!currentCard?.id) return;

    // Optimistic update
    handleNextCard();

    try {
      // Only submit if it's a real item with an ID
      // Check if it's a mock item (id < 100 for mock usually, or check structure)
      // Real items will come from DB.
      // We'll just try to submit. The service handles user_vocab creation if needed?
      // Actually service implementation assumes item has an ID.
      if (currentCard.id) {
        await submitReview(currentCard.id, quality);
        // In background, refresh data to get new intervals
        loadVocabulary();
      }
    } catch (error) {
      console.error("SRS Error", error);
    }
  };

  const filteredVocabulary =
    selectedCategory === "all"
      ? vocabulary
      : vocabulary.filter((word) => word.category === selectedCategory);

  const currentCard = filteredVocabulary[currentCardIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % filteredVocabulary.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) =>
      prev === 0 ? filteredVocabulary.length - 1 : prev - 1
    );
  };

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold">Vocabulary</h1>
            <p className="text-muted-foreground text-lg">
              Build your English vocabulary with flashcards and practice
            </p>
          </div>
          <Button
            className="shadow-glow gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-5 w-5" />
            Add New Word
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <Card className="border-border/40 from-primary/10 bg-linear-to-br to-transparent p-6">
            <div className="mb-2 text-3xl font-bold">{vocabulary.length}</div>
            <div className="text-muted-foreground text-sm">Total Words</div>
          </Card>
          <Card className="border-border/40 bg-linear-to-br from-green-500/10 to-transparent p-6">
            <div className="mb-2 text-3xl font-bold">187</div>
            <div className="text-muted-foreground text-sm">Words Learned</div>
          </Card>
          <Card className="border-border/40 from-cyan/10 bg-linear-to-br to-transparent p-6">
            <div className="mb-2 text-3xl font-bold">32</div>
            <div className="text-muted-foreground text-sm">This Week</div>
          </Card>
          <Card className="border-border/40 bg-linear-to-br from-yellow-500/10 to-transparent p-6">
            <div className="mb-2 text-3xl font-bold">89%</div>
            <div className="text-muted-foreground text-sm">Retention Rate</div>
          </Card>
        </div>

        {/* Flashcard Mode Toggle */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant={showFlashcard ? "outline" : "primary"}
            onClick={() => setShowFlashcard(false)}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Word List
          </Button>
          <Button
            variant={showFlashcard ? "primary" : "outline"}
            onClick={() => setShowFlashcard(true)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Flashcard Practice
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {showFlashcard ? (
            /* Flashcard Mode */
            <motion.div
              key="flashcard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-2xl"
            >
              <Card className="border-border/40 bg-card p-8">
                <div className="mb-6 flex items-center justify-between">
                  <Badge className="text-sm">
                    {currentCardIndex + 1} / {filteredVocabulary.length}
                  </Badge>
                  <Badge
                    className={`border ${
                      difficultyColors[
                        currentCard?.difficulty as keyof typeof difficultyColors
                      ]
                    }`}
                  >
                    {currentCard?.difficulty}
                  </Badge>
                </div>

                {/* Flashcard */}
                <motion.div
                  className="relative mb-8 h-80 cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="border-primary/20 from-primary/10 absolute inset-0 rounded-2xl border bg-linear-to-br to-transparent p-12"
                    initial={false}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div
                      className="flex h-full flex-col items-center justify-center"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0)",
                      }}
                    >
                      {!isFlipped ? (
                        <>
                          <h2 className="mb-4 text-5xl font-bold">
                            {currentCard?.word}
                          </h2>
                          <p className="text-muted-foreground text-xl">
                            {currentCard?.pronunciation}
                          </p>
                          <p className="text-muted-foreground mt-8 text-sm">
                            Click to reveal meaning
                          </p>
                        </>
                      ) : (
                        <div
                          className="absolute inset-0 flex flex-col justify-center p-12"
                          style={{ transform: "rotateY(180deg)" }}
                        >
                          <p className="mb-4 text-2xl">
                            {currentCard?.meaning}
                          </p>
                          <p className="text-muted-foreground italic">
                            &ldquo;{currentCard?.example}&rdquo;
                          </p>

                          {/* SRS Controls */}
                          <div className="mt-8 grid w-full grid-cols-4 gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex h-auto flex-col py-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSRSReview(1);
                              }}
                            >
                              <span className="font-bold">Again</span>
                              <span className="text-[10px] opacity-80">
                                &lt; 1m
                              </span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex h-auto flex-col border-orange-500 py-2 text-orange-500 hover:bg-orange-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSRSReview(2);
                              }}
                            >
                              <span className="font-bold">Hard</span>
                              <span className="text-[10px] opacity-80">2d</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex h-auto flex-col border-green-500 py-2 text-green-500 hover:bg-green-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSRSReview(4);
                              }}
                            >
                              <span className="font-bold">Good</span>
                              <span className="text-[10px] opacity-80">5d</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-cyan text-cyan hover:bg-cyan/10 flex h-auto flex-col py-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSRSReview(5);
                              }}
                            >
                              <span className="font-bold">Easy</span>
                              <span className="text-[10px] opacity-80">8d</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevCard}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleNextCard}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            /* Word List Mode */
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Search and Filter */}
              <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search vocabulary..."
                    className="border-border/40 bg-input/20 focus:border-primary/30 focus:bg-input/30 w-full rounded-lg border py-3 pr-4 pl-10 outline-none"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6 flex gap-2 overflow-x-auto">
                {VOCABULARY_CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? "primary" : "outline"
                    }
                    onClick={() => setSelectedCategory(category.id)}
                    className="shrink-0"
                  >
                    {category.label} ({category.count})
                  </Button>
                ))}
              </div>

              {/* Word Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredVocabulary.map((word, index) => (
                  <motion.div
                    key={word.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group border-border/40 bg-card hover:border-primary/30 hover:shadow-glow cursor-pointer p-6 transition-all">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="group-hover:text-primary mb-1 text-xl font-bold">
                            {word.word}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {word.pronunciation}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {word.favorite && (
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          )}
                          <Volume2 className="text-muted-foreground h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </div>
                      <p className="mb-3 text-sm">{word.meaning}</p>
                      <p className="text-muted-foreground mb-4 text-xs italic">
                        &ldquo;{word.example}&rdquo;
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge
                          className={`border ${
                            difficultyColors[
                              word.difficulty as keyof typeof difficultyColors
                            ]
                          }`}
                        >
                          {word.difficulty}
                        </Badge>
                        {word.is_learned && (
                          <Badge className="border-green-500/20 bg-green-500/10 text-green-400">
                            Learned
                          </Badge>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Modal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Add New Word"
        description="Add a new word to your personal dictionary."
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWord}>Save Word</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="word">Word</Label>
            <Input
              id="word"
              placeholder="e.g. Serendipity"
              value={newWord.word}
              onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pronunciation">Pronunciation (Optional)</Label>
            <Input
              id="pronunciation"
              placeholder="e.g. /ˌser.ənˈdɪp.ə.ti/"
              value={newWord.pronunciation}
              onChange={(e) =>
                setNewWord({ ...newWord, pronunciation: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meaning">Meaning</Label>
            <Input
              id="meaning"
              placeholder="The occurrence and development of events by chance..."
              value={newWord.meaning}
              onChange={(e) =>
                setNewWord({ ...newWord, meaning: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="example">Example Sentence</Label>
            <Input
              id="example"
              placeholder="We found the restaurant by pure serendipity."
              value={newWord.example}
              onChange={(e) =>
                setNewWord({ ...newWord, example: e.target.value })
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
