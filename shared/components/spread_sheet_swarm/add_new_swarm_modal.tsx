'use client';

import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

export default function AddNewSwarm() {
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create Spreadsheet Swarm</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Spreadsheet Swarm</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter swarm name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Enter swarm description" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" placeholder="Enter tags (comma-separated)" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="use-cases">Use Cases</Label>
            <Textarea id="use-cases" placeholder="Enter use cases" />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public">Make Public</Label>
          </div>
          <Button type="submit" className="w-full">
            Create Swarm
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
