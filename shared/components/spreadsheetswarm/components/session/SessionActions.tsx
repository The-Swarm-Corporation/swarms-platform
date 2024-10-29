import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/spread_sheet_swarm/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/Button';
import {
  MoreHorizontal,
  Save,
  Upload,
  Download,
  Share2,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface SessionActionsProps {
  onDownloadJSON: () => void;
  onUploadJSON: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadCSV: () => void;
  onShare: () => void;
  onNewSession: () => void;
  isUpdating: boolean;
}

export const SessionActions: React.FC<SessionActionsProps> = ({
  onDownloadJSON,
  onUploadJSON,
  onDownloadCSV,
  onShare,
  onNewSession,
  isUpdating,
}) => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MoreHorizontal className="size-4 mr-2" /> Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Swarm Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDownloadJSON}>
            <Save className="size-4 mr-2" /> Save JSON
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {isUpdating ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Upload className="size-4 mr-2" />
            )}
            Load JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDownloadCSV}>
            <Download className="size-4 mr-2" /> Download CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShare}>
            <Share2 className="size-4 mr-2" /> Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onNewSession}>
            <RefreshCw className="size-4 mr-2" /> New Session
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        id="file-upload"
        type="file"
        accept=".json"
        className="hidden"
        onChange={onUploadJSON}
      />
    </>
  );
};
