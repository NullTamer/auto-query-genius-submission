
import React from "react";
import { JobBoardSelection } from "./types";
import JobBoardCheckbox from "./JobBoardCheckbox";
import { getProviderDisplayName } from "./utils/searchUrlUtils";

interface RegionTabContentProps {
  providers: string[];
  selectedBoards: JobBoardSelection;
  onBoardSelectionChange: (board: string, selected: boolean) => void;
}

const RegionTabContent: React.FC<RegionTabContentProps> = ({
  providers,
  selectedBoards,
  onBoardSelectionChange
}) => {
  if (!providers || providers.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No platforms available in this region.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
      {providers.map(provider => (
        <JobBoardCheckbox
          key={provider}
          id={`board-${provider}`}
          name={provider}
          label={getProviderDisplayName(provider)}
          checked={!!selectedBoards[provider]}
          onChange={(checked) => onBoardSelectionChange(provider, checked)}
        />
      ))}
    </div>
  );
};

export default RegionTabContent;
