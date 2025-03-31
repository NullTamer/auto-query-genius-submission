
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CandidateResultsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const CandidateResultsPagination: React.FC<CandidateResultsPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  const handlePrevious = () => {
    if (currentPage > 1 && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col items-center mt-6">
      <div className="text-sm text-muted-foreground mb-2">
        Page {currentPage} of {totalPages}
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={handlePrevious}
              className={currentPage === 1 || isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
              aria-disabled={currentPage === 1 || isLoading}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={handleNext}
              className={currentPage === totalPages || isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
              aria-disabled={currentPage === totalPages || isLoading}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default CandidateResultsPagination;
