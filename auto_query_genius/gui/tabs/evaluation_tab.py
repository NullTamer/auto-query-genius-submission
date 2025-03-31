
"""
Auto Query Genius - Evaluation Tab

This module provides the evaluation tab for the GUI.
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, filedialog, messagebox
import os
import threading
import json
import csv
import time
from pathlib import Path

from auto_query_genius.processor.evaluation_processor import run_evaluation
from auto_query_genius.gui.utils import create_scrolled_text, save_text_to_file

def create_evaluation_tab(notebook, app):
    """Create the tab for evaluation functionality."""
    eval_tab = ttk.Frame(notebook)
    notebook.add(eval_tab, text="Evaluation")
    
    # Create component instance
    component = EvaluationTab(eval_tab, app)
    
    return component

class EvaluationTab:
    def __init__(self, parent, app):
        self.parent = parent
        self.app = app
        
        # Evaluation progress tracking
        self.is_evaluating = False
        
        # Create main container frame
        self.main_frame = ttk.Frame(self.parent)
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Create file selection frame
        self._create_file_selection_frame()
        
        # Create dataset preview
        self._create_dataset_preview()
        
        # Create evaluation options section
        self._create_evaluation_options()
        
        # Create evaluation results section
        self._create_results_section()
        
        # Create progress frame but don't pack it yet
        self._create_progress_frame()
    
    def _create_file_selection_frame(self):
        """Create the file selection section of the tab."""
        file_frame = ttk.Frame(self.main_frame)
        file_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Label(file_frame, text="Benchmark dataset:").pack(side=tk.LEFT, padx=5)
        self.eval_file_var = tk.StringVar()
        eval_file_entry = ttk.Entry(file_frame, textvariable=self.eval_file_var, width=50)
        eval_file_entry.pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        ttk.Button(file_frame, text="Browse...", command=self.select_eval_file).pack(side=tk.LEFT, padx=5)
        
        # Button to run evaluation
        self.run_button = ttk.Button(file_frame, text="Run Evaluation", command=self.run_evaluation)
        self.run_button.pack(side=tk.LEFT, padx=5)
    
    def _create_dataset_preview(self):
        """Create a preview section for the dataset."""
        preview_frame = ttk.LabelFrame(self.main_frame, text="Dataset Preview")
        preview_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # Add dataset format info
        format_frame = ttk.Frame(preview_frame)
        format_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(
            format_frame, 
            text="Supported formats: JSON and CSV files with job descriptions and ground truth keywords.",
            font=("Arial", 9, "italic")
        ).pack(side=tk.LEFT)
        
        help_button = ttk.Button(format_frame, text="Format Help", command=self.show_format_help)
        help_button.pack(side=tk.RIGHT)
        
        # Dataset content preview
        self.dataset_preview = scrolledtext.ScrolledText(preview_frame, wrap=tk.WORD, height=5)
        self.dataset_preview.pack(fill=tk.X, padx=5, pady=5)
        self.dataset_preview.insert(tk.END, "No dataset loaded. Please select a benchmark dataset file (JSON or CSV).")
        self.dataset_preview.config(state=tk.DISABLED)

    def _create_evaluation_options(self):
        """Create the evaluation options section."""
        options_frame = ttk.LabelFrame(self.main_frame, text="Evaluation Options")
        options_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # AI extraction checkbox
        self.use_ai_var = tk.BooleanVar(value=False)
        ai_check = ttk.Checkbutton(
            options_frame, 
            text="Use AI-powered extraction (requires API key)", 
            variable=self.use_ai_var,
            command=self._toggle_api_key_visibility
        )
        ai_check.pack(anchor=tk.W, padx=5, pady=5)
        
        # API key input (initially hidden)
        self.api_key_frame = ttk.Frame(options_frame)
        ttk.Label(self.api_key_frame, text="Gemini API Key:").pack(side=tk.LEFT, padx=5)
        self.api_key_var = tk.StringVar()
        self.api_key_entry = ttk.Entry(self.api_key_frame, textvariable=self.api_key_var, width=40, show="*")
        self.api_key_entry.pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        
        # Show/hide password toggle
        self.show_key_var = tk.BooleanVar(value=False)
        self.show_key_check = ttk.Checkbutton(
            self.api_key_frame, 
            text="Show", 
            variable=self.show_key_var,
            command=self._toggle_api_key_visibility
        )
        self.show_key_check.pack(side=tk.LEFT, padx=5)
        
        # Information about AI extraction
        info_frame = ttk.Frame(options_frame)
        info_frame.pack(fill=tk.X, padx=5, pady=5)
        
        info_text = """
        Note: AI-powered extraction uses Gemini API for enhanced keyword extraction.
        Standard extraction uses TF-IDF algorithm which is faster but may be less accurate.
        Benchmark comparison will show difference between both methods.
        """
        info_label = ttk.Label(
            info_frame, 
            text=info_text, 
            font=("Arial", 9, "italic"),
            wraplength=500,
            justify=tk.LEFT
        )
        info_label.pack(fill=tk.X)
    
    def _toggle_api_key_visibility(self):
        """Toggle API key entry visibility based on use_ai checkbox."""
        if self.use_ai_var.get():
            self.api_key_frame.pack(fill=tk.X, padx=5, pady=5)
            # Toggle show/hide password
            if self.show_key_var.get():
                self.api_key_entry.config(show="")
            else:
                self.api_key_entry.config(show="*")
        else:
            self.api_key_frame.pack_forget()

    def _create_progress_frame(self):
        """Create the progress indicator frame but don't pack it yet."""
        self.progress_frame = ttk.Frame(self.main_frame)
        
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(
            self.progress_frame, 
            variable=self.progress_var,
            mode='indeterminate',
            length=200
        )
        self.progress_bar.pack(side=tk.LEFT, padx=5)
        
        self.status_label = ttk.Label(self.progress_frame, text="Evaluation in progress...")
        self.status_label.pack(side=tk.LEFT, padx=5)
    
    def _create_results_section(self):
        """Create the results section of the tab."""
        results_frame = ttk.LabelFrame(self.main_frame, text="Evaluation Results")
        results_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # Create results tabs
        results_notebook = ttk.Notebook(results_frame)
        results_notebook.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Overall results tab
        overall_tab = ttk.Frame(results_notebook)
        results_notebook.add(overall_tab, text="Overall Results")
        
        self.overall_results_text = scrolledtext.ScrolledText(overall_tab, wrap=tk.WORD, height=10)
        self.overall_results_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Item details tab
        details_tab = ttk.Frame(results_notebook)
        results_notebook.add(details_tab, text="Item Details")
        
        self.details_results_text = scrolledtext.ScrolledText(details_tab, wrap=tk.WORD, height=10)
        self.details_results_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Comparison tab
        comparison_tab = ttk.Frame(results_notebook)
        results_notebook.add(comparison_tab, text="Baseline Comparison")
        
        self.comparison_results_text = scrolledtext.ScrolledText(comparison_tab, wrap=tk.WORD, height=10)
        self.comparison_results_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Create button frame for exporting results
        button_frame = ttk.Frame(results_frame)
        button_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Button(button_frame, text="Export Results", command=self.export_results).pack(side=tk.RIGHT, padx=5)
    
    def select_eval_file(self):
        """Select a benchmark dataset file for evaluation."""
        file_path = filedialog.askopenfilename(
            title="Select Benchmark Dataset",
            filetypes=[("JSON files", "*.json"), ("CSV files", "*.csv"), ("All files", "*.*")]
        )
        
        if file_path:
            self.eval_file_var.set(file_path)
            self.preview_dataset(file_path)
    
    def preview_dataset(self, file_path):
        """Preview the selected dataset."""
        try:
            # Enable preview text widget for editing
            self.dataset_preview.config(state=tk.NORMAL)
            self.dataset_preview.delete(1.0, tk.END)
            
            file_ext = Path(file_path).suffix.lower()
            
            if file_ext == '.json':
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Display summary of the dataset
                if isinstance(data, list):
                    self.dataset_preview.insert(tk.END, f"JSON dataset with {len(data)} items\n")
                    
                    # Sample the first item
                    if data:
                        self.dataset_preview.insert(tk.END, "\nSample item:\n")
                        sample = data[0]
                        for key, value in sample.items():
                            if isinstance(value, list):
                                self.dataset_preview.insert(tk.END, f"{key}: List with {len(value)} items\n")
                            elif isinstance(value, dict):
                                self.dataset_preview.insert(tk.END, f"{key}: Dictionary with {len(value)} keys\n")
                            else:
                                preview = str(value)
                                if len(preview) > 50:
                                    preview = preview[:50] + "..."
                                self.dataset_preview.insert(tk.END, f"{key}: {preview}\n")
                else:
                    self.dataset_preview.insert(tk.END, "JSON data is not a list. Expected a list of evaluation items.")
            
            elif file_ext == '.csv':
                with open(file_path, 'r', encoding='utf-8') as f:
                    # Use csv module to properly handle quoted fields
                    reader = csv.reader(f)
                    rows = list(reader)
                
                self.dataset_preview.insert(tk.END, f"CSV dataset with {len(rows)} rows\n")
                
                if len(rows) > 0:
                    self.dataset_preview.insert(tk.END, "\nHeader:\n")
                    self.dataset_preview.insert(tk.END, ", ".join(rows[0]) + "\n")
                
                if len(rows) > 1:
                    self.dataset_preview.insert(tk.END, "\nFirst data row:\n")
                    first_row = rows[1]
                    # Limit display length for each cell
                    first_row_display = []
                    for cell in first_row:
                        if len(cell) > 30:
                            first_row_display.append(cell[:30] + "...")
                        else:
                            first_row_display.append(cell)
                    self.dataset_preview.insert(tk.END, ", ".join(first_row_display))
            
            else:
                # For other file types, just show a generic message
                self.dataset_preview.insert(tk.END, f"File loaded: {os.path.basename(file_path)}\n")
                self.dataset_preview.insert(tk.END, "Preview not available for this file type.")
            
            # Disable editing
            self.dataset_preview.config(state=tk.DISABLED)
            
        except Exception as e:
            self.dataset_preview.delete(1.0, tk.END)
            self.dataset_preview.insert(tk.END, f"Error previewing dataset: {str(e)}")
            self.dataset_preview.config(state=tk.DISABLED)
    
    def show_format_help(self):
        """Show help information about dataset formats."""
        help_window = tk.Toplevel(self.parent)
        help_window.title("Dataset Format Help")
        help_window.geometry("600x500")
        help_window.grab_set()  # Make window modal
        
        # Add scrolled text with format info
        text_widget = scrolledtext.ScrolledText(help_window, wrap=tk.WORD)
        text_widget.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Add help text
        text_widget.insert(tk.END, "SUPPORTED DATASET FORMATS\n\n", "heading")
        
        text_widget.insert(tk.END, "JSON FORMAT:\n\n", "subheading")
        json_example = '''[
  {
    "id": "job1",
    "text": "Full job description text here...",
    "keywords": [
      {"keyword": "Python", "frequency": 5},
      {"keyword": "Django", "frequency": 3},
      {"keyword": "Flask", "frequency": 2}
    ]
  },
  {
    "id": "job2",
    "text": "Another job description...",
    "keywords": [
      {"keyword": "JavaScript", "frequency": 4},
      {"keyword": "React", "frequency": 3}
    ]
  }
]'''
        text_widget.insert(tk.END, json_example + "\n\n")
        
        text_widget.insert(tk.END, "CSV FORMAT (Standard):\n\n", "subheading")
        csv_example = '''id,text,keywords
job1,"Full job description text here...","Python:5,Django:3,Flask:2"
job2,"Another job description...","JavaScript:4,React:3"'''
        text_widget.insert(tk.END, csv_example + "\n\n")
        
        text_widget.insert(tk.END, "CSV FORMAT (Job Descriptions):\n\n", "subheading")
        csv_job_example = '''company_name,job_description,position_title,model_response
Google,"Minimum 5 years experience in software development...","Senior Software Engineer",{"keywords":[{"term":"software","count":3},{"term":"development","count":2}]}
Apple,"Experience with mobile app development...","iOS Developer",{"keywords":[{"term":"iOS","count":4},{"term":"mobile","count":2}]}'''
        text_widget.insert(tk.END, csv_job_example + "\n\n")
        
        text_widget.insert(tk.END, "NOTES:\n\n", "subheading")
        text_widget.insert(tk.END, "1. For JSON files, each item must have 'text' and 'keywords' fields.\n")
        text_widget.insert(tk.END, "2. For CSV files, the keywords can be in various formats:\n")
        text_widget.insert(tk.END, "   - Comma-separated list of 'keyword:frequency' pairs\n")
        text_widget.insert(tk.END, "   - JSON string containing a keywords array\n")
        text_widget.insert(tk.END, "3. The evaluation will match extracted keywords against ground truth keywords.\n")
        text_widget.insert(tk.END, "4. Large datasets may take longer to process.\n")
        
        # Configure tags
        text_widget.tag_configure("heading", font=("Arial", 12, "bold"))
        text_widget.tag_configure("subheading", font=("Arial", 10, "bold"))
        
        # Make read-only
        text_widget.config(state=tk.DISABLED)
        
        # Add close button
        close_button = ttk.Button(help_window, text="Close", command=help_window.destroy)
        close_button.pack(pady=10)
    
    def run_evaluation(self):
        """Run the evaluation on a benchmark dataset."""
        eval_file = self.eval_file_var.get().strip()
        
        if not eval_file:
            messagebox.showwarning("Warning", "Please select a benchmark dataset file.")
            return
        
        if not os.path.exists(eval_file):
            messagebox.showerror("Error", f"File not found: {eval_file}")
            return
        
        # Check if using AI and validate API key
        use_ai = self.use_ai_var.get()
        gemini_api_key = None
        
        if use_ai:
            gemini_api_key = self.api_key_var.get().strip()
            if not gemini_api_key:
                messagebox.showwarning("Warning", "Please enter your Gemini API key to use AI extraction.")
                return
        
        # Disable run button
        self.run_button.config(state=tk.DISABLED)
        
        # Clear and setup results text widgets
        for widget in [self.overall_results_text, self.details_results_text, self.comparison_results_text]:
            widget.config(state=tk.NORMAL)
            widget.delete(1.0, tk.END)
            widget.insert(tk.END, "Evaluation in progress...\n")
            widget.config(state=tk.DISABLED)
        
        # Show progress indicator
        self.progress_frame.pack(fill=tk.X, padx=10, pady=5, after=self.dataset_preview.master)
        self.progress_bar.start(10)  # Start animation
        self.is_evaluating = True
        self.eval_start_time = time.time()
        
        # Update app status
        extraction_method = "AI-powered" if use_ai else "baseline"
        self.app.status_var.set(f"Running {extraction_method} evaluation...")
        
        # Run evaluation in a separate thread
        def eval_thread():
            try:
                results = run_evaluation(
                    eval_file, 
                    use_ai=use_ai, 
                    gemini_api_key=gemini_api_key
                )
                
                # Update UI with results (in main thread)
                self.parent.after_idle(lambda: self._finish_evaluation(results))
                
            except Exception as e:
                # Display error and stop progress indicators (in main thread)
                self.parent.after_idle(lambda: self._handle_evaluation_error(str(e)))
        
        # Start evaluation thread
        threading.Thread(target=eval_thread, daemon=True).start()
    
    def _finish_evaluation(self, results):
        """Finish the evaluation and display results."""
        self.progress_bar.stop()
        self.progress_frame.pack_forget()
        self.is_evaluating = False
        
        # Re-enable run button
        self.run_button.config(state=tk.NORMAL)
        
        # Update status
        self.app.status_var.set("Evaluation complete")
        
        # Display overall results
        self.overall_results_text.config(state=tk.NORMAL)
        self.overall_results_text.delete(1.0, tk.END)
        
        self.overall_results_text.insert(tk.END, "=== EVALUATION RESULTS ===\n\n")
        self.overall_results_text.insert(tk.END, f"Precision: {results.get('precision', 0):.2f}\n")
        self.overall_results_text.insert(tk.END, f"Recall: {results.get('recall', 0):.2f}\n")
        self.overall_results_text.insert(tk.END, f"F1 Score: {results.get('f1_score', 0):.2f}\n\n")
        
        if 'average_rank_correlation' in results:
            self.overall_results_text.insert(tk.END, f"Rank Correlation: {results.get('average_rank_correlation', 0):.2f}\n\n")
        
        # Add extraction method used
        self.overall_results_text.insert(tk.END, f"Extraction Method: {'AI-powered' if self.use_ai_var.get() else 'Baseline (TF-IDF)'}\n\n")
        
        # Add statistical significance if available
        if 'statistical_significance' in results:
            self.overall_results_text.insert(tk.END, "Statistical Significance:\n")
            for test, value in results['statistical_significance'].items():
                self.overall_results_text.insert(tk.END, f"{test}: {value}\n")
        
        self.overall_results_text.config(state=tk.DISABLED)
        
        # Display item details
        self.details_results_text.config(state=tk.NORMAL)
        self.details_results_text.delete(1.0, tk.END)
        
        if 'items' in results:
            self.details_results_text.insert(tk.END, "=== PER-ITEM RESULTS ===\n\n")
            for i, item in enumerate(results['items'], 1):
                self.details_results_text.insert(tk.END, f"Item {i}:\n")
                self.details_results_text.insert(tk.END, f"  Precision: {item.get('precision', 0):.2f}\n")
                self.details_results_text.insert(tk.END, f"  Recall: {item.get('recall', 0):.2f}\n")
                self.details_results_text.insert(tk.END, f"  F1 Score: {item.get('f1_score', 0):.2f}\n")
                
                # Display extracted keywords if available
                if 'extracted_keywords' in item:
                    self.details_results_text.insert(tk.END, "  Extracted Keywords:\n")
                    for kw in item['extracted_keywords'][:5]:  # Show top 5
                        self.details_results_text.insert(tk.END, f"    - {kw}\n")
                    if len(item['extracted_keywords']) > 5:
                        self.details_results_text.insert(tk.END, f"    - (and {len(item['extracted_keywords']) - 5} more)\n")
                
                self.details_results_text.insert(tk.END, "\n")
        else:
            self.details_results_text.insert(tk.END, "No per-item results available.")
        
        self.details_results_text.config(state=tk.DISABLED)
        
        # Display comparison results
        self.comparison_results_text.config(state=tk.NORMAL)
        self.comparison_results_text.delete(1.0, tk.END)
        
        if 'baseline' in results:
            baseline = results['baseline']
            ai_metrics = {
                'precision': results.get('precision', 0),
                'recall': results.get('recall', 0),
                'f1_score': results.get('f1_score', 0)
            }
            
            self.comparison_results_text.insert(tk.END, "=== BASELINE COMPARISON ===\n\n")
            self.comparison_results_text.insert(tk.END, "AI Algorithm:\n")
            for metric, value in ai_metrics.items():
                self.comparison_results_text.insert(tk.END, f"  {metric.replace('_', ' ').title()}: {value:.2f}\n")
            
            self.comparison_results_text.insert(tk.END, "\nBaseline Algorithm:\n")
            for metric, value in baseline.items():
                if metric in ['precision', 'recall', 'f1_score']:
                    self.comparison_results_text.insert(tk.END, f"  {metric.replace('_', ' ').title()}: {value:.2f}\n")
            
            # Calculate improvements
            self.comparison_results_text.insert(tk.END, "\nImprovement:\n")
            for metric in ['precision', 'recall', 'f1_score']:
                ai_value = ai_metrics[metric]
                baseline_value = baseline.get(metric, 0)
                
                if baseline_value == 0:
                    improvement = "N/A"
                else:
                    improvement = ((ai_value - baseline_value) / baseline_value) * 100
                    improvement = f"{improvement:.1f}%"
                
                self.comparison_results_text.insert(tk.END, f"  {metric.replace('_', ' ').title()}: {improvement}\n")
        else:
            self.comparison_results_text.insert(tk.END, "No baseline comparison available.")
        
        self.comparison_results_text.config(state=tk.DISABLED)
    
    def _handle_evaluation_error(self, error_message):
        """Handle errors during evaluation."""
        self.progress_bar.stop()
        self.progress_frame.pack_forget()
        self.is_evaluating = False
        
        # Re-enable run button
        self.run_button.config(state=tk.NORMAL)
        
        # Update widgets with error
        for widget in [self.overall_results_text, self.details_results_text, self.comparison_results_text]:
            widget.config(state=tk.NORMAL)
            widget.delete(1.0, tk.END)
            widget.insert(tk.END, f"Error during evaluation: {error_message}")
            widget.config(state=tk.NORMAL)
        
        self.app.status_var.set("Evaluation failed")
        messagebox.showerror("Evaluation Error", error_message)
    
    def export_results(self):
        """Export evaluation results to a file."""
        # Get results from text widgets
        overall_results = self.overall_results_text.get(1.0, tk.END).strip()
        details_results = self.details_results_text.get(1.0, tk.END).strip()
        comparison_results = self.comparison_results_text.get(1.0, tk.END).strip()
        
        if not overall_results or overall_results == "Evaluation in progress...":
            messagebox.showwarning("Warning", "No evaluation results to export.")
            return
        
        # Ask for file path
        file_path = filedialog.asksaveasfilename(
            title="Export Evaluation Results",
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        
        if not file_path:
            return
        
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(overall_results)
                f.write("\n\n")
                f.write(details_results)
                f.write("\n\n")
                f.write(comparison_results)
            
            self.app.status_var.set(f"Results exported to: {os.path.basename(file_path)}")
            messagebox.showinfo("Export Complete", f"Results exported to: {file_path}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to export results: {str(e)}")

