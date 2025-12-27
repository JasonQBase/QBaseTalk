"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { Search, BookOpen, TrendingUp, Filter, X } from "lucide-react";
import { IdiomCard } from "@/components/features/IdiomCard";
import {
  getIdioms,
  getCategories,
  getLearnedCount,
  type IdiomWithProgress,
} from "@/lib/services/idioms";

export default function IdiomsPage() {
  const [idioms, setIdioms] = useState<IdiomWithProgress[]>([]);
  const [filteredIdioms, setFilteredIdioms] = useState<IdiomWithProgress[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "Beginner" | "Intermediate" | "Advanced" | null
  >(null);
  const [learnedCount, setLearnedCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...idioms];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (idiom) =>
          idiom.phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
          idiom.meaning.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (idiom) => idiom.category === selectedCategory
      );
    }

    // Apply difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter(
        (idiom) => idiom.difficulty === selectedDifficulty
      );
    }

    setFilteredIdioms(filtered);
  }, [idioms, searchQuery, selectedCategory, selectedDifficulty]);

  async function loadData() {
    try {
      setLoading(true);
      const [idiomsData, categoriesData, learned] = await Promise.all([
        getIdioms(),
        getCategories(),
        getLearnedCount(),
      ]);
      setIdioms(idiomsData);
      setCategories(categoriesData);
      setLearnedCount(learned);
    } catch (error) {
      console.error("Failed to load idioms:", error);
    } finally {
      setLoading(false);
    }
  }
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedDifficulty(null);
  };

  const hasActiveFilters =
    searchQuery || selectedCategory || selectedDifficulty;

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-4">
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
        </div>
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold">Idioms & Phrases Explorer</h1>
        <p className="text-muted-foreground">
          Master English idioms with cultural context and real-world examples
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card variant="default" className="flex items-center gap-4">
          <div className="bg-primary/10 rounded-full p-3">
            <BookOpen className="text-primary h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{idioms.length}</p>
            <p className="text-muted-foreground text-sm">Total Idioms</p>
          </div>
        </Card>

        <Card variant="default" className="flex items-center gap-4">
          <div className="rounded-full bg-green-500/10 p-3">
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{learnedCount}</p>
            <p className="text-muted-foreground text-sm">Learned</p>
          </div>
        </Card>

        <Card variant="default" className="flex items-center gap-4">
          <div className="rounded-full bg-yellow-500/10 p-3">
            <Filter className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{filteredIdioms.length}</p>
            <p className="text-muted-foreground text-sm">Showing</p>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search idioms by phrase or meaning..."
              className="border-border bg-background focus:ring-primary w-full rounded-lg border py-3 pr-4 pl-10 focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <div className="flex gap-2">
                {(["Beginner", "Intermediate", "Advanced"] as const).map(
                  (level) => (
                    <Button
                      key={level}
                      variant={
                        selectedDifficulty === level ? "primary" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setSelectedDifficulty(
                          selectedDifficulty === level ? null : level
                        )
                      }
                    >
                      {level}
                    </Button>
                  )
                )}
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "primary" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === category ? null : category
                      )
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 self-end"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Idioms Grid */}
      {filteredIdioms.length === 0 ? (
        <Card className="py-12 text-center">
          <Search className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
          <h3 className="mb-2 text-xl font-semibold">No idioms found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters}>Clear Filters</Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredIdioms.map((idiom, index) => (
            <motion.div
              key={idiom.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <IdiomCard idiom={idiom} onLearnedToggle={loadData} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
