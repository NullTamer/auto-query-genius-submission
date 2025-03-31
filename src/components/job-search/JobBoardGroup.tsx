
import React from "react";
import { JobBoardSelection, SearchProvider } from "./types";
import JobBoardCheckbox from "./JobBoardCheckbox";
import { getProviderDisplayName } from "./utils/searchUrlUtils";

interface JobBoardGroupProps {
  groupName: string;
  boards: string[];
  selectedBoards: JobBoardSelection;
  currentProvider: SearchProvider;
  onToggleBoard: (board: keyof JobBoardSelection) => void;
}

const JobBoardGroup: React.FC<JobBoardGroupProps> = ({
  groupName,
  boards,
  selectedBoards,
  currentProvider,
  onToggleBoard,
}) => {
  return (
    <div className="mb-4">
      <h4 className="text-xs uppercase text-muted-foreground mb-2">{groupName}</h4>
      <div className="flex flex-wrap gap-2">
        {boards.map(board => (
          <div key={board} className="w-full sm:w-auto">
            <JobBoardCheckbox
              id={`board-${board}`}
              name={board}
              label={getProviderDisplayName(board)}
              checked={!!selectedBoards[board as keyof JobBoardSelection]}
              onChange={() => onToggleBoard(board as keyof JobBoardSelection)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobBoardGroup;
