import { Ballot } from "@council/sdk";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import Link from "next/link";
import { ReactElement, useMemo, useState } from "react";
import { formatTimeLeft } from "src/dates/formatTimeLeft";
import { ProposalStatus } from "src/proposals/getProposalStatus";
import { makeProposalURL } from "src/routes";
import {
  SortableGridTable,
  SortOptions,
} from "src/ui/base/tables/SortableGridTable";
import { Tooltip } from "src/ui/base/Tooltip/Tooltip";
import { tooltipByStatus } from "src/ui/proposals/tooltips";
import {FormattedBallot, FormattedBinaryBallot} from "src/ui/voting/FormattedBallot";
import { useAccount } from "wagmi";

export interface ProposalRowData {
  id: string;
  title: string;
  status: ProposalStatus;
  created: Date | null;
  ballot?: string;
  votingEnds?: Date | null;
  sentenceSummary?: string;
}

interface ProposalsTableProps {
  rowData: ProposalRowData[];
}

export function ProposalsTable({ rowData }: ProposalsTableProps): ReactElement {
  const { address: account } = useAccount();
  const [sortOptions, setSortOptions] = useState<SortOptions<SortField>>({
    direction: "DESC",
    key: "votingEnds",
  });

  const sortedData = useMemo(
    () => sortProposalRowData(sortOptions, rowData),
    [sortOptions, rowData],
  );

  const [votes, setVotes] = useState({});
  const [convictions, setConvictions] = useState({});
  const [isEditable, setIsEditable] = useState({});


  const calculateConviction = (votes, timeElapsed, halfLife) => {
    const decayFactor = Math.pow(0.5, timeElapsed / halfLife);
    const conviction = votes * decayFactor;
    return conviction;
  };
  
  const handleVoteChange = (e, index) => {
    const updatedVotes = {...votes};
    const updatedConviction = {...convictions};
    const clampedValue = Math.max(0, Math.min(100, parseInt(e.target.value)));
    updatedVotes[index] = clampedValue;
    setVotes(updatedVotes);
    // TODO: Remove Hardcode for timeElapsed
    const timeElapsed = 3600; // 1 hour in seconds
    const halfLife = 1800; // Half-life period of 30 minutes in seconds
    updatedConviction[index] = calculateConviction(updatedVotes[index], timeElapsed, halfLife);
    setConvictions(updatedConviction);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // const clampedValue = Math.max(0, Math.min(100, parseInt(e.target.value)));
      // e.target.value = clampedValue.toString();
      setIsEditable({...isEditable, [index]: false});
    }
  }

  return (
    <>
      <div className="hidden md:block">
        <SortableGridTable
          headingRowClassName="grid-cols-[3fr_1fr_1fr_1fr_1fr]"
          bodyRowClassName="group grid-cols-[3fr_1fr_1fr_1fr_1fr] items-center"
          onSort={setSortOptions}
          cols={[
            "Name",
            {
              cell: "Voting Ends",
              sortKey: "votingEnds",
            },
            {
              cell: "Status",
              sortKey: "status",
            },
            "Your Ballot",
            "Conviction",
          ]}
          rows={sortedData.map(
            ({
              status,
              ballot,
              id,
              votingEnds,
              sentenceSummary,
              title,
            }, index) => ({
              cells: [
                <span key={`${id}-name`}>
                  {title ?? `${votingContractName} Proposal ${id}`}
                  {sentenceSummary && (
                    <p className="text-sm opacity-60">
                      {sentenceSummary.length > 80
                        ? `${sentenceSummary.slice(0, 80)}\u2026` // unicode for horizontal ellipses
                        : sentenceSummary}
                    </p>
                  )}
                </span>,

                votingEnds ? formatTimeLeft(votingEnds) : <em>unknown</em>,


                <StatusBadge key={`${id}-status`} status={status} />,
                
                  ballot ? (
                  <FormattedBinaryBallot ballot={ballot} />
                ) : account ? (
                  <div><input type="number" min = {0} max = {100} className="w-20" value = {votes[index] || 0 } onChange={(e) => handleVoteChange(e, index)} onKeyDown={(e) => handleKeyDown(e, index)} readOnly = {isEditable[index]==false}
                  className= {isEditable[index] ? '' : 'bg-gray-200'}/> </div>
                  // <em>Not voted</em>
                ) : (
                  <em>Not connected</em>
                ),

               <em> {convictions[index]}</em> 
                ,
              ],
            }),
          )}
        />
      </div>
      <div className="md:hidden flex flex-col gap-6">
        {sortedData.map(
          (
            {
              status,
              ballot,
              id,
              sentenceSummary,
              title,
            },
            i,
          ) => (
            <Link
              key={i}
              href={''/** todo: use url to vote on proposal */}
              className="daisy-card bg-base-200 hover:shadow-xl transition-shadow"
            >
              <div className="daisy-card-body justify-between">
                <h3 className="text-2xl daisy-card-title">
                  {`${id}: ${title}`}
                </h3>
                {sentenceSummary && (
                  <p className="opacity-60">
                    {sentenceSummary.length > 80
                      ? `${sentenceSummary.slice(0, 80)}\u2026` // unicode for horizontal ellipses
                      : sentenceSummary}
                  </p>
                )}
                <div className="mt-4 grid grid-flow-col auto-cols-fr border-t border-base-300">
                  <div className=" px-4 py-2 flex flex-col justify-center border-r border-base-300">
                    <span className="text-sm opacity-60">Status</span>
                    <StatusBadge status={status} />
                  </div>
                  <div className=" px-4 py-2 flex flex-col justify-center">
                    <span className="text-sm opacity-60">Your Ballot</span>
                    {ballot ? (
                      <FormattedBallot ballot={ballot} />
                    ) : account ? (
                      <em>Not voted</em>
                    ) : (
                      <em>Not connected</em>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ),
        )}
      </div>
    </>
  );
}

type SortField = "votingEnds" | "status";

function sortProposalRowData(
  { direction = "DESC", key = "votingEnds" }: SortOptions<SortField>,
  data: ProposalRowData[],
) {
  if (key === "status") {
    if (direction === "ASC") {
      return data.slice().sort((a, b) => +a.currentQuorum - +b.currentQuorum);
    } else {
      return data.slice().sort((a, b) => +b.currentQuorum - +a.currentQuorum);
    }
  }
  // safe to assume the desired sort field is voting ends column
  // since there are only two sortable columns.
  else {
    if (direction === "ASC") {
      return data.slice().sort((a, b) => {
        const aTime = a.votingEnds ? a.votingEnds.getTime() : 0;
        const bTime = b.votingEnds ? b.votingEnds.getTime() : 0;
        return aTime - bTime;
      });
    } else {
      return data.slice().sort((a, b) => {
        const aTime = a.votingEnds ? a.votingEnds.getTime() : 0;
        const bTime = b.votingEnds ? b.votingEnds.getTime() : 0;
        return bTime - aTime;
      });
    }
  }
}

function StatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <Tooltip content={tooltipByStatus[status]}>
      <div
        className={classNames("font-bold daisy-badge", {
          "daisy-badge-error": status === "FAILED",
          "daisy-badge-info": status === "IN PROGRESS",
          "daisy-badge-success": status === "EXECUTED",
          "daisy-badge-warning": status === "EXPIRED",
        })}
      >
        {status}
      </div>
    </Tooltip>
  );
}
