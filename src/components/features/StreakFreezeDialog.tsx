"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/lib/hooks/use-toast";
import { Snowflake, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StreakFreezeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  freezeDate: string;
  freezesAvailable: number;
  onSuccess?: () => void;
}

export function StreakFreezeDialog({
  isOpen,
  onClose,
  freezeDate,
  freezesAvailable,
  onSuccess,
}: StreakFreezeDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  async function handleUseFreeze() {
    if (freezesAvailable <= 0) {
      toast({
        title: "No freezes available",
        description:
          "You don't have any streak freeze tokens. Keep learning to earn more!",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { useStreakFreeze: applyStreakFreeze } =
        await import("@/lib/services/streaks");
      const result = await applyStreakFreeze(freezeDate);

      if (result.success) {
        setSuccess(true);
        toast({
          title: "Streak freeze applied!",
          description: `You have ${result.freezesRemaining || 0} freeze${result.freezesRemaining !== 1 ? "s" : ""} remaining.`,
        });

        setTimeout(() => {
          onSuccess?.();
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        toast({
          title: "Failed to apply freeze",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error using freeze:", error);
      toast({
        title: "Error",
        description: "An error occurred while applying the freeze.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-blue-500" />
            Use Streak Freeze
          </DialogTitle>
          <DialogDescription>
            Protect your streak from being broken
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
              >
                <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
              </motion.div>
              <h3 className="mb-2 text-xl font-semibold text-green-600 dark:text-green-400">
                Freeze Applied!
              </h3>
              <p className="text-muted-foreground">
                Your streak has been protected
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-muted space-y-2 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{formatDate(freezeDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Freezes available:
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {freezesAvailable}
                  </span>
                </div>
              </div>

              {freezesAvailable > 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Using a freeze will protect your streak for this missed day.
                    You&apos;ll have{" "}
                    <strong>
                      {freezesAvailable - 1} freeze
                      {freezesAvailable - 1 !== 1 ? "s" : ""}
                    </strong>{" "}
                    remaining.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You don&apos;t have any freezes available. Earn more by
                    reaching streak milestones!
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2 rounded-lg bg-blue-500/10 p-4 dark:bg-blue-400/20">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  How to earn more freezes:
                </h4>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>• Reach 30-day milestone: +1 freeze</li>
                  <li>• Reach 100-day milestone: +1 freeze</li>
                  <li>• Reach 365-day milestone: +1 freeze</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!success && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleUseFreeze}
              disabled={freezesAvailable <= 0 || isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? "Applying..." : "Use Freeze"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
