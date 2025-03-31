
"""
Auto Query Genius - Process Tab Output Section

This module provides the output section component for the process tab.
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, filedialog, messagebox
import os
import json

from auto_query_genius.gui.utils import save_text_to_file, save_json_to_file

class OutputSection:
    def __init__(self, parent, app):
        self.parent = parent
        self.app = app
        
        # Create the output frame
        self._create_output_frame()
    
    def _create_output_frame(self):
        """Create the output section of the process tab."""
        output_frame = ttk.LabelFrame(self.parent, text="Results")
        output_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # Add tabs for keywords and query
        results_notebook = ttk.Notebook(output_frame)
        results_notebook.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Keywords tab
        keywords_tab = ttk.Frame(results_notebook)
        results_notebook.add(keywords_tab, text="Keywords")
        
        ttk.Label(keywords_tab, text="Extracted Keywords:").pack(anchor=tk.W, padx=5, pady=2)
        self.keywords_text = scrolledtext.ScrolledText(keywords_tab, wrap=tk.WORD, height=15)
        self.keywords_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Add categories tab
        categories_tab = ttk.Frame(results_notebook)
        results_notebook.add(categories_tab, text="Categories")
        
        ttk.Label(categories_tab, text="Keywords by Category:").pack(anchor=tk.W, padx=5, pady=2)
        self.categories_text = scrolledtext.ScrolledText(categories_tab, wrap=tk.WORD, height=15)
        self.categories_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Query tab
        query_tab = ttk.Frame(results_notebook)
        results_notebook.add(query_tab, text="Boolean Query")
        
        ttk.Label(query_tab, text="Generated Boolean Query:").pack(anchor=tk.W, padx=5, pady=2)
        self.query_text = scrolledtext.ScrolledText(query_tab, wrap=tk.WORD, height=15)
        self.query_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Save results button
        save_frame = ttk.Frame(output_frame)
        save_frame.pack(fill=tk.X, padx=5, pady=5)
        ttk.Button(save_frame, text="Save Results", command=self.save_results).pack(side=tk.RIGHT, padx=5)
    
    def display_results(self, keywords, query):
        """Display the processing results in the UI."""
        # Clear previous results
        self.keywords_text.config(state=tk.NORMAL)
        self.keywords_text.delete(1.0, tk.END)
        self.query_text.config(state=tk.NORMAL)
        self.query_text.delete(1.0, tk.END)
        self.categories_text.config(state=tk.NORMAL)
        self.categories_text.delete(1.0, tk.END)
        
        # Display keywords
        if keywords:
            for i, kw in enumerate(keywords, 1):
                # Handle both 'frequency' and 'score' keys for backward compatibility
                value = kw.get('score', kw.get('frequency', 0))
                category = kw.get('category', 'Uncategorized')
                self.keywords_text.insert(tk.END, f"{i}. {kw['keyword']} (score: {value:.2f}, category: {category})\n")
        else:
            self.keywords_text.insert(tk.END, "No keywords were extracted.")
        
        # Display keywords by category
        if keywords:
            # Group keywords by category
            categories = {}
            for kw in keywords:
                category = kw.get('category', 'Uncategorized')
                if category not in categories:
                    categories[category] = []
                categories[category].append(kw)
            
            # Display each category
            for category, terms in sorted(categories.items()):
                self.categories_text.insert(tk.END, f"=== {category.upper()} ===\n")
                for i, kw in enumerate(terms, 1):
                    value = kw.get('score', kw.get('frequency', 0))
                    self.categories_text.insert(tk.END, f"{i}. {kw['keyword']} (score: {value:.2f})\n")
                self.categories_text.insert(tk.END, "\n")
        else:
            self.categories_text.insert(tk.END, "No categorized keywords available.")
        
        # Display query
        if query:
            self.query_text.insert(tk.END, query)
        else:
            self.query_text.insert(tk.END, "No query was generated.")
    
    def save_results(self):
        """Save the processing results to a file."""
        # Get the current results
        keywords_text = self.keywords_text.get(1.0, tk.END).strip()
        categories_text = self.categories_text.get(1.0, tk.END).strip()
        query_text = self.query_text.get(1.0, tk.END).strip()
        
        if not keywords_text and not query_text:
            messagebox.showwarning("Warning", "No results to save.")
            return
        
        # Ask for file path
        file_path = filedialog.asksaveasfilename(
            title="Save Results",
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("JSON files", "*.json"), ("All files", "*.*")]
        )
        
        if not file_path:
            return
        
        try:
            # Save based on file extension
            if file_path.lower().endswith('.json'):
                # Parse keywords from text (this is a simplification)
                keywords_list = []
                for line in keywords_text.splitlines():
                    if line.strip():
                        parts = line.split('(score:')
                        if len(parts) == 2:
                            # Extract keyword
                            keyword_part = parts[0].strip()
                            if keyword_part.startswith(f"{len(keywords_list) + 1}. "):
                                keyword = keyword_part[len(f"{len(keywords_list) + 1}. "):]
                            else:
                                keyword = keyword_part
                            
                            # Extract score and category
                            score_category_part = parts[1].replace(')', '').strip()
                            score_category_parts = score_category_part.split(',')
                            
                            score = float(score_category_parts[0].strip())
                            category = "Uncategorized"
                            
                            if len(score_category_parts) > 1 and "category:" in score_category_parts[1]:
                                category = score_category_parts[1].split("category:")[1].strip()
                            
                            keywords_list.append({
                                "keyword": keyword, 
                                "score": score,
                                "category": category
                            })
                
                # Save as JSON
                data = {
                    "keywords": keywords_list,
                    "query": query_text,
                    "categorized": categories_text
                }
                success = save_json_to_file(file_path, data)
            else:
                # Save as plain text
                content = "=== EXTRACTED KEYWORDS ===\n\n"
                content += keywords_text
                content += "\n\n=== KEYWORDS BY CATEGORY ===\n\n"
                content += categories_text
                content += "\n\n=== GENERATED BOOLEAN QUERY ===\n\n"
                content += query_text
                success = save_text_to_file(file_path, content)
            
            if success:
                self.app.status_var.set(f"Results saved to: {os.path.basename(file_path)}")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save results: {str(e)}")
    
    def clear(self):
        """Clear the output section."""
        self.keywords_text.config(state=tk.NORMAL)
        self.keywords_text.delete(1.0, tk.END)
        self.categories_text.config(state=tk.NORMAL)
        self.categories_text.delete(1.0, tk.END)
        self.query_text.config(state=tk.NORMAL)
        self.query_text.delete(1.0, tk.END)
