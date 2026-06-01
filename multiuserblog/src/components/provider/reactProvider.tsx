'use client'

import { QueryClient,QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

function Provider({children,}:{children:React.ReactNode}){
    const [queryClient]=useState(()=>new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
          },
        },
      }));
    return(
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
export default Provider;