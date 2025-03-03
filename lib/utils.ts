import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with tailwindcss classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a human-readable string
 */
export function formatDate(date: Date | string): string {
  // Convert string to Date if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const now = new Date();
  
  // Format: Today at 2:30 PM
  if (
    dateObj.getDate() === now.getDate() &&
    dateObj.getMonth() === now.getMonth() &&
    dateObj.getFullYear() === now.getFullYear()
  ) {
    return `Today at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Format: Yesterday at 2:30 PM
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  ) {
    return `Yesterday at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Format: Jan 1, 2023 at 2:30 PM
  return `${dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * Truncates a string to a specified length with ellipsis
 */
export function truncateString(str: string, maxLength: number = 50): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Extracts sentiment value from text (-1 to 1)
 * This is a simple implementation for demo purposes
 */
export function extractSentiment(text: string): number {
  const positiveWords = ['happy', 'good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'joy', 'excited', 'pleased'];
  const negativeWords = ['sad', 'bad', 'awful', 'terrible', 'horrible', 'hate', 'angry', 'upset', 'disappointed', 'frustrated'];
  
  const lowerText = text.toLowerCase();
  let sentiment = 0;
  
  // Count positive and negative words
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) sentiment += 0.1;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) sentiment -= 0.1;
  });
  
  // Clamp between -1 and 1
  return Math.max(-1, Math.min(1, sentiment));
}

/**
 * Extracts key decisions from diary text for visualization
 */
export function extractKeyDecisions(text: string): string[] {
  const decisions = [];
  const lines = text.split('\n');
  
  // Simple heuristic to find lines that might be decisions
  for (const line of lines) {
    if (
      line.includes('decided') || 
      line.includes('choose') || 
      line.includes('selected') || 
      line.includes('opted') ||
      line.includes('I will') ||
      line.includes('I have')
    ) {
      decisions.push(line.trim());
    }
  }
  
  return decisions;
}

/**
 * Gets a color for a sentiment value (-1 to 1)
 */
export function getSentimentColor(sentiment: number | 'positive' | 'neutral' | 'negative' | undefined): string {
  // Handle string sentiment values
  if (typeof sentiment === 'string') {
    if (sentiment === 'positive') return '#22c55e'; // Green
    if (sentiment === 'negative') return '#ef4444'; // Red
    return '#eab308'; // Yellow for neutral
  }
  
  // Handle undefined
  if (sentiment === undefined) return '#eab308'; // Yellow for neutral
  
  // Handle number sentiment values
  if (sentiment < -0.3) return '#ef4444'; // Red
  if (sentiment > 0.3) return '#22c55e';  // Green
  return '#eab308';  // Yellow
} 