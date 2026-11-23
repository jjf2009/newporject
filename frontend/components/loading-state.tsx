import React from "react";

export function LoadingState({ message = "Loading data from MongoDB..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}
