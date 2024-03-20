import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsTrigger, TabsList } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TagInput from "./tagInput";

export function FilterSearch({ tags, onTagsChange }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Filter</Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] mt-2">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Filter Search</h4>
            <p className="text-sm text-muted-foreground">
              Quickly filter searches for specific posts.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label>Date Posted</Label>
              <Tabs
                defaultValue="account"
                className="w-[200px] col-span-2 px-2"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="account">Oldest</TabsTrigger>
                  <TabsTrigger value="password">Newest</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label>Popularity</Label>
              <Tabs
                defaultValue="account"
                className="w-[200px] col-span-2 px-2"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="account">Lowest</TabsTrigger>
                  <TabsTrigger value="password">Highest</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex flex-col gap-4 mt-6">
              <Label>Tags</Label>
              <TagInput tags={tags} onChange={onTagsChange} />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
