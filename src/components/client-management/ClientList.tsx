
import { useState } from "react";
import { Search, Plus, Filter, Trash2, Edit, FileText, Tags } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Client, ClientFilterParams } from "@/types/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format, isAfter, isBefore, isValid } from "date-fns";
import { cn } from "@/lib/utils";

interface ClientListProps {
  clients: Client[];
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
}

const ClientList = ({ clients, onEditClient, onDeleteClient }: ClientListProps) => {
  const [filterParams, setFilterParams] = useState<ClientFilterParams>({
    search: "",
    tag: undefined,
    dateRange: undefined
  });
  const [showFilters, setShowFilters] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  
  const uniqueTags = [...new Set(clients.flatMap(client => client.tags || []))];
  
  const filteredClients = clients.filter(client => {
    // Search filter
    const searchMatch = !filterParams.search || 
      client.fullName.toLowerCase().includes(filterParams.search.toLowerCase()) ||
      client.email.toLowerCase().includes(filterParams.search.toLowerCase()) ||
      client.companyName?.toLowerCase().includes(filterParams.search.toLowerCase()) ||
      false;
    
    // Tag filter
    const tagMatch = !filterParams.tag || 
      client.tags?.includes(filterParams.tag) || 
      false;
    
    // Date range filter
    let dateMatch = true;
    if (filterParams.dateRange?.from || filterParams.dateRange?.to) {
      const createdDate = new Date(client.createdAt);
      
      if (filterParams.dateRange.from && isValid(filterParams.dateRange.from)) {
        dateMatch = dateMatch && isAfter(createdDate, filterParams.dateRange.from);
      }
      
      if (filterParams.dateRange.to && isValid(filterParams.dateRange.to)) {
        dateMatch = dateMatch && isBefore(createdDate, filterParams.dateRange.to);
      }
    }
    
    return searchMatch && tagMatch && dateMatch;
  });

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              className="pl-9"
              value={filterParams.search}
              onChange={(e) => setFilterParams({...filterParams, search: e.target.value})}
            />
          </div>
          
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="text-sm font-medium mb-2">Filter by Tag</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Tags className="h-4 w-4" />
                    {filterParams.tag || "Select Tag"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterParams({...filterParams, tag: undefined})}>
                    All Tags
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {uniqueTags.map(tag => (
                    <DropdownMenuItem 
                      key={tag}
                      onClick={() => setFilterParams({...filterParams, tag})}
                    >
                      {tag}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Created Date Range</p>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !filterParams.dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      {filterParams.dateRange?.from ? (
                        format(filterParams.dateRange.from, "PPP")
                      ) : (
                        "From date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filterParams.dateRange?.from}
                      onSelect={(date) =>
                        setFilterParams({
                          ...filterParams,
                          dateRange: { 
                            ...filterParams.dateRange,
                            from: date
                          }
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !filterParams.dateRange?.to && "text-muted-foreground"
                      )}
                    >
                      {filterParams.dateRange?.to ? (
                        format(filterParams.dateRange.to, "PPP")
                      ) : (
                        "To date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filterParams.dateRange?.to}
                      onSelect={(date) =>
                        setFilterParams({
                          ...filterParams,
                          dateRange: {
                            ...filterParams.dateRange,
                            to: date
                          }
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="ghost" 
                onClick={() => setFilterParams({ search: "" })}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}
        
        {filteredClients.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">No clients found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead className="hidden lg:table-cell">Tags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:cursor-pointer">
                    <TableCell
                      className="font-medium"
                      onClick={() => setShowDetails(client.id === showDetails ? null : client.id)}
                    >
                      {client.fullName}
                    </TableCell>
                    <TableCell 
                      className="hidden md:table-cell"
                      onClick={() => setShowDetails(client.id === showDetails ? null : client.id)}
                    >
                      {client.email}
                    </TableCell>
                    <TableCell 
                      className="hidden md:table-cell"
                      onClick={() => setShowDetails(client.id === showDetails ? null : client.id)}
                    >
                      {client.phone}
                    </TableCell>
                    <TableCell 
                      className="hidden md:table-cell"
                      onClick={() => setShowDetails(client.id === showDetails ? null : client.id)}
                    >
                      {client.companyName || "-"}
                    </TableCell>
                    <TableCell 
                      className="hidden lg:table-cell"
                      onClick={() => setShowDetails(client.id === showDetails ? null : client.id)}
                    >
                      <div className="flex flex-wrap gap-1">
                        {client.tags?.map(tag => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                        {!client.tags?.length && "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEditClient(client)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setClientToDelete(client)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {/* Confirmation dialog for client deletion */}
      <Dialog 
        open={!!clientToDelete} 
        onOpenChange={(isOpen) => !isOpen && setClientToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this client?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the client
              and remove their data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClientToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (clientToDelete) {
                  onDeleteClient(clientToDelete.id);
                  setClientToDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Client details dialog */}
      <Dialog 
        open={!!showDetails} 
        onOpenChange={(isOpen) => !isOpen && setShowDetails(null)}
      >
        <DialogContent className="max-w-3xl">
          {showDetails && clients.find(c => c.id === showDetails) && (
            <>
              <DialogHeader>
                <DialogTitle>Client Details</DialogTitle>
                <DialogDescription>
                  Detailed information about the client
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {(() => {
                  const client = clients.find(c => c.id === showDetails)!;
                  return (
                    <>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Full Name</h4>
                        <p>{client.fullName}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                        <p>{client.email}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                        <p>{client.phone}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Company Name</h4>
                        <p>{client.companyName || "-"}</p>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                        <p>{client.address || "-"}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
                        <div className="flex flex-wrap gap-1">
                          {client.tags?.map(tag => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                          {!client.tags?.length && "-"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Added On</h4>
                        <p>{new Date(client.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                        <p className="whitespace-pre-wrap">{client.notes || "-"}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetails(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const client = clients.find(c => c.id === showDetails);
                    if (client) {
                      onEditClient(client);
                      setShowDetails(null);
                    }
                  }}
                >
                  Edit Client
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientList;
