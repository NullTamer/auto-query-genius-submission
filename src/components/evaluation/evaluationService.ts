
import { EvaluationDataItem, EvaluationResult, KeywordItem } from "./types";
import { processResults } from "./services/resultProcessor";
import { processAllItemsInBatches } from "./services/batchProcessor";
import { extractBaselineKeywords, baselineExtraction } from "./utils/baselineAlgorithm";
import { aiExtraction } from "./utils/aiKeywordExtraction";

type ProgressCallback = (processed: number, total: number) => void;

/**
 * Run the evaluation process on the dataset
 */
export const runEvaluation = async (
  dataItems: EvaluationDataItem[], 
  progressCallback?: ProgressCallback,
  useAI: boolean = false,
  apiKey?: string
): Promise<EvaluationResult> => {
  console.log(`Starting evaluation with ${dataItems.length} items, useAI: ${useAI}, apiKey provided: ${!!apiKey}`);
  
  if (useAI && !apiKey) {
    console.warn("AI extraction requested but no API key provided");
  }
  
  // Create a custom callback to track both progress and process items
  const itemProcessedCallback = async (item: EvaluationDataItem, index: number) => {
    console.log(`Processing item ${index + 1}: ${item.id}`);
    
    // Always get baseline keywords for comparison regardless of extraction method
    try {
      const baselineKeywords = await baselineExtraction(item.description);
      console.log(`Baseline extraction for item ${index + 1} produced ${baselineKeywords.length} keywords`);
      
      // Attach baseline keywords to the item for comparison
      return {
        ...item,
        baselineKeywords
      };
    } catch (error) {
      console.error(`Error getting baseline keywords for item ${index + 1}:`, error);
      return item;
    }
  };
  
  try {
    // Process all items in batches
    const processedItems = await processAllItemsInBatches(
      dataItems,
      !useAI || !apiKey, // usingFallback if not using AI or no API key
      progressCallback,
      itemProcessedCallback // Use our custom callback to process each item
    );
    
    // Make sure each item has baseline keywords for comparison
    const itemsWithBaseline = processedItems.map(item => {
      if (!item.baselineKeywords || !Array.isArray(item.baselineKeywords)) {
        console.log(`Adding baseline keywords for item ${item.id}`);
        // If baseline keywords are missing, add them now
        const baselineKeywords = extractBaselineKeywords(item.description);
        return {
          ...item,
          baselineKeywords
        };
      }
      return item;
    });
    
    console.log(`Processed ${itemsWithBaseline.length} items, all with baseline keywords`);
    
    // Process results into final format
    return processResults(itemsWithBaseline);
    
  } catch (error) {
    console.error("Error during evaluation:", error);
    throw new Error(`Evaluation failed: ${(error as Error).message}`);
  }
};
