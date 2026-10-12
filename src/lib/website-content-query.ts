import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getWebsiteContent } from "./website-content.functions";

export const websiteContentOptions = queryOptions({ queryKey: ["website-content"], queryFn: () => getWebsiteContent(), staleTime: 0 });
export function useWebsiteContent() { return useSuspenseQuery(websiteContentOptions).data; }