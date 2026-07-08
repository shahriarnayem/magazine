"use client";
import React from "react";
/**
 * Minimal client-side error boundary used to gracefully recover from
 * BlockNote editor crashes when loading older/seeded content whose block
 * schema doesn't fully match the installed BlockNote version.
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error) {
        this.props.onError?.(error);
    }
    componentDidUpdate(prevProps) {
        // Reset when the children change (e.g. switching articles) so the
        // boundary can try rendering again with the new content.
        if (prevProps.children !== this.props.children && this.state.hasError) {
            this.setState({ hasError: false, error: undefined });
        }
    }
    render() {
        if (this.state.hasError) {
            return (this.props.fallback ?? (<div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            <p className="font-semibold">Couldn&apos;t load editor content</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {this.state.error?.message || "Unknown error"}
            </p>
          </div>));
        }
        return this.props.children;
    }
}
