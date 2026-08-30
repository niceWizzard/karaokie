import React from "react";
import Header from "@/components/header";

export default function DefaultLayout({children} : React.PropsWithChildren) {
    return <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col">
            {children}
        </div>
    </div>
}
