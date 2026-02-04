import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import "@/styles/editor.css"; // We will create this for custom styles

interface EditorProps {
    initialContent?: string;
    onChange?: (content: string) => void;
    editable?: boolean;
}

const Editor = ({ initialContent, onChange, editable = true }: EditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder: "Type '/' for commands...",
                emptyEditorClass: 'is-editor-empty',
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Typography,
        ],
        content: initialContent ? JSON.parse(initialContent) : null,
        editable,
        onUpdate: ({ editor }: { editor: any }) => { // basic typing for now
            const json = JSON.stringify(editor.getJSON());
            if (onChange) {
                onChange(json);
            }
        },
        editorProps: {
            attributes: {
                class: cn(
                    "prose dark:prose-invert max-w-none w-full focus:outline-none min-h-[50vh]",
                    "prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-4",
                    "prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-2",
                    "prose-h3:text-xl prose-h3:font-medium prose-h3:mb-1",
                    "prose-p:my-2 prose-p:leading-relaxed",
                    "prose-li:my-0.5",
                    "prose-task-list:list-none prose-task-list:pl-0",
                    "prose-task-item:flex prose-task-item:items-start prose-task-item:gap-2",
                ),
            },
        },
    });

    // Update content if initialContent changes (e.g., switching pages)
    useEffect(() => {
        if (editor && initialContent) {
            // We only set content if the editor's current content is different to avoid cursor jumps
            // But for full page switching we usually just want to reset.
            // A simpler way for page switching is to remount the component or clear + set content.

            // For now, let's just attempt to set it if it's vastly different or we assume it's a new mount.
            // Actually, standard practice: Key the Editor component by Page ID to force remount.
        }
    }, [initialContent, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto pb-20">
            <EditorContent editor={editor} />
        </div>
    );
};

export default Editor;
