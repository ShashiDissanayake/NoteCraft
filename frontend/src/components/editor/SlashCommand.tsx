import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Editor } from '@tiptap/react';
import { Heading1, Heading2, Heading3, List, CheckSquare, Text } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface CommandListProps {
    items: any[];
    command: any;
    editor: Editor;
}

export const CommandList = forwardRef((props: CommandListProps, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command(item);
        }
    };

    useEffect(() => {
        setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
                return true;
            }
            if (event.key === 'ArrowDown') {
                setSelectedIndex((selectedIndex + 1) % props.items.length);
                return true;
            }
            if (event.key === 'Enter') {
                selectItem(selectedIndex);
                return true;
            }
            return false;
        },
    }));

    return (
        <div className="z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animation-scale-in-fade-in slide-in-from-top-1">
            {props.items.length ? (
                <div className="flex flex-col gap-1">
                    {props.items.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Button
                                key={index}
                                variant={index === selectedIndex ? "secondary" : "ghost"}
                                className="w-full justify-start gap-2 px-2 h-auto py-1.5 font-normal"
                                onClick={() => selectItem(index)}
                            >
                                <div className="flex items-center justify-center w-5 h-5 border rounded-sm bg-background">
                                    <Icon className="w-3 h-3" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-sm font-medium leading-none mb-0.5">{item.title}</span>
                                    <span className="text-xs text-muted-foreground">{item.description}</span>
                                </div>
                            </Button>
                        );
                    })}
                </div>
            ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">No results</div>
            )}
        </div>
    );
});

export const getSuggestionItems = ({ query }: { query: string }) => {
    return [
        {
            title: 'Text',
            description: 'Just start writing with plain text.',
            searchTerms: ['p', 'paragraph'],
            icon: Text,
            command: ({ editor, range }: any) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .toggleNode('paragraph', 'paragraph')
                    .run();
            },
        },
        {
            title: 'Heading 1',
            description: 'Big section heading.',
            searchTerms: ['h1', 'header', 'big'],
            icon: Heading1,
            command: ({ editor, range }: any) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setNode('heading', { level: 1 })
                    .run();
            },
        },
        {
            title: 'Heading 2',
            description: 'Medium section heading.',
            searchTerms: ['h2', 'header', 'medium'],
            icon: Heading2,
            command: ({ editor, range }: any) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setNode('heading', { level: 2 })
                    .run();
            },
        },
        {
            title: 'Heading 3',
            description: 'Small section heading.',
            searchTerms: ['h3', 'header', 'small'],
            icon: Heading3,
            command: ({ editor, range }: any) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setNode('heading', { level: 3 })
                    .run();
            },
        },
        {
            title: 'To-do List',
            description: 'Track tasks with a to-do list.',
            searchTerms: ['todo', 'task', 'list', 'check', 'checkbox'],
            icon: CheckSquare,
            command: ({ editor, range }: any) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .toggleTaskList()
                    .run();
            },
        },
        {
            title: 'Bullet List',
            description: 'Create a simple bulleted list.',
            searchTerms: ['unordered', 'point'],
            icon: List,
            command: ({ editor, range }: any) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .toggleBulletList()
                    .run();
            },
        },
    ].filter((item) => {
        if (typeof query === 'string' && query.length > 0) {
            const search = query.toLowerCase();
            return (
                item.title.toLowerCase().includes(search) ||
                item.description.toLowerCase().includes(search) ||
                (item.searchTerms && item.searchTerms.some((term: string) => term.includes(search)))
            );
        }
        return true;
    });
};
