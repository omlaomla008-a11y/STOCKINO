"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
} from "lucide-react";

import { MarkdownContent } from "@/components/blog/markdown-content";
import { uploadHubImageAction } from "@/lib/hub/actions";
import {
  insertAtCursor,
  prefixLines,
  wrapSelection,
  type TextareaInsertTarget,
} from "@/lib/markdown/editor-helpers";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type MarkdownEditorProps = {
  name?: string;
  initialValue?: string;
  required?: boolean;
  minRows?: number;
};

type ToolbarAction = {
  label: string;
  icon: ReactNode;
  run: (value: string, target: TextareaInsertTarget) => {
    value: string;
    selectionStart: number;
    selectionEnd: number;
  };
};

const ALIGN = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
} as const;

function alignWrap(className: string) {
  return (value: string, target: TextareaInsertTarget) =>
    wrapSelection(
      value,
      target,
      `<p class="${className}">`,
      "</p>",
      "Votre paragraphe",
    );
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  {
    label: "Titre H2",
    icon: <Heading2 className="h-4 w-4" />,
    run: (v, t) => prefixLines(v, t, "## "),
  },
  {
    label: "Titre H3",
    icon: <Heading3 className="h-4 w-4" />,
    run: (v, t) => prefixLines(v, t, "### "),
  },
  {
    label: "Gras",
    icon: <Bold className="h-4 w-4" />,
    run: (v, t) => wrapSelection(v, t, "**", "**", "texte en gras"),
  },
  {
    label: "Italique",
    icon: <Italic className="h-4 w-4" />,
    run: (v, t) => wrapSelection(v, t, "*", "*", "texte en italique"),
  },
  {
    label: "Lien",
    icon: <Link2 className="h-4 w-4" />,
    run: (v, t) => wrapSelection(v, t, "[", "](https://)", "libellé du lien"),
  },
  {
    label: "Liste à puces",
    icon: <List className="h-4 w-4" />,
    run: (v, t) => prefixLines(v, t, "- "),
  },
  {
    label: "Liste numérotée",
    icon: <ListOrdered className="h-4 w-4" />,
    run: (v, t) => prefixLines(v, t, "1. "),
  },
  {
    label: "Citation",
    icon: <Quote className="h-4 w-4" />,
    run: (v, t) => prefixLines(v, t, "> "),
  },
  {
    label: "Aligner à gauche",
    icon: <AlignLeft className="h-4 w-4" />,
    run: alignWrap(ALIGN.left),
  },
  {
    label: "Centrer",
    icon: <AlignCenter className="h-4 w-4" />,
    run: alignWrap(ALIGN.center),
  },
  {
    label: "Aligner à droite",
    icon: <AlignRight className="h-4 w-4" />,
    run: alignWrap(ALIGN.right),
  },
  {
    label: "Justifier",
    icon: <AlignJustify className="h-4 w-4" />,
    run: alignWrap(ALIGN.justify),
  },
  {
    label: "Ligne horizontale",
    icon: <Minus className="h-4 w-4" />,
    run: (v, t) => insertAtCursor(v, t, "\n\n---\n\n"),
  },
];

export function MarkdownEditor({
  name = "content",
  initialValue = "",
  required = true,
  minRows = 16,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialValue);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const getTarget = (): TextareaInsertTarget | null => {
    const el = textareaRef.current;
    if (!el) return null;
    return {
      value: el.value,
      selectionStart: el.selectionStart,
      selectionEnd: el.selectionEnd,
    };
  };

  const applyEdit = (result: {
    value: string;
    selectionStart: number;
    selectionEnd: number;
  }) => {
    setValue(result.value);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  const runAction = (action: ToolbarAction["run"]) => {
    const target = getTarget();
    if (!target) return;
    applyEdit(action(value, target));
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadHubImageAction(fd);
    setUploadingImage(false);
    if (result.status === "success" && result.imageUrl) {
      const target = getTarget();
      if (!target) return;
      const alt = file.name.replace(/\.[^.]+$/, "");
      applyEdit(
        insertAtCursor(
          value,
          target,
          `\n\n<img src="${result.imageUrl}" alt="${alt}" class="my-6 w-full rounded-lg border" />\n\n`,
        ),
      );
    } else {
      alert(result.message ?? "Échec de l'upload");
    }
  };

  const insertImageUrl = () => {
    const url = window.prompt("URL de l'image (https://…)");
    if (!url?.trim()) return;
    const target = getTarget();
    if (!target) return;
    applyEdit(
      insertAtCursor(
        value,
        target,
        `\n\n![Image](${url.trim()})\n\n`,
      ),
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor="content-editor">Contenu de l&apos;article</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview((p) => !p)}
        >
          {showPreview ? "Éditer" : "Aperçu"}
        </Button>
      </div>

      <TooltipProvider delayDuration={300}>
        <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-2">
          {TOOLBAR_ACTIONS.map((action) => (
            <Tooltip key={action.label}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => runAction(action.run)}
                  aria-label={action.label}
                >
                  {action.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{action.label}</TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                aria-label="Insérer une image"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {uploadingImage ? "Envoi…" : "Image (upload)"}
            </TooltipContent>
          </Tooltip>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={insertImageUrl}
          >
            URL image
          </Button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImageUpload(file);
              e.target.value = "";
            }}
          />
        </div>
      </TooltipProvider>

      {showPreview ? (
        <div
          className={cn(
            "min-h-[320px] rounded-lg border bg-background p-4",
            "prose prose-neutral max-w-none dark:prose-invert",
          )}
        >
          {value.trim() ? (
            <MarkdownContent content={value} />
          ) : (
            <p className="text-sm text-muted-foreground">Rien à prévisualiser.</p>
          )}
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          id="content-editor"
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={minRows}
          required={required}
          className="font-mono text-sm leading-relaxed"
        />
      )}

      <p className="text-xs text-muted-foreground">
        Barre d&apos;outils : titres, gras, listes, alignement (gauche / centre / droite /
        justifié), images. Les liens internes :{" "}
        <code className="rounded bg-muted px-1">[texte](/hardware/slug)</code>
      </p>
    </div>
  );
}
