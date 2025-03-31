
import { EvaluationDataItem } from "../types";
import { processEvaluationItem } from "./evaluationItemProcessor";

type ProgressCallback = (processed: number, total: number) => void;
type ItemProcessedCallback = (item: EvaluationDataItem, index: number) => Promise<EvaluationDataItem>;

/**
 * Process all evaluation items in batches to avoid UI freezing
 */
export const processAllItemsInBatches = async (
  dataItems: EvaluationDataItem[],
  useBaseline: boolean = false,
  progressCallback?: ProgressCallback,
  itemProcessedCallback?: ItemProcessedCallback,
  apiKey?: string
) => {
  const batchSize = 5;
  const results = [];
  let processedCount = 0;
  const totalItems = dataItems.length;
  
  console.log(`Processing ${totalItems} items in batches of ${batchSize}, using ${useBaseline ? 'baseline' : 'AI'} extraction`);
  
  // Process items in batches
  for (let i = 0; i < totalItems; i += batchSize) {
    const batch = dataItems.slice(i, i + batchSize);
    
    // Process this batch
    const batchPromises = batch.map(async (item, batchIndex) => {
      const index = i + batchIndex;
      
      // Apply preprocessor if provided
      let itemToProcess = item;
      if (itemProcessedCallback) {
        itemToProcess = await itemProcessedCallback(item, index);
      }
      
      // Process this item
      const result = await processEvaluationItem(
        itemToProcess, 
        index, 
        totalItems, 
        useBaseline,
        apiKey
      );
      
      // Update progress
      processedCount++;
      if (progressCallback) {
        progressCallback(processedCount, totalItems);
      }
      
      return result;
    });
    
    // Wait for all items in this batch to complete
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Allow UI to update between batches
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
};
