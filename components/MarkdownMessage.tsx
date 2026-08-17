"use client";

/**
 * Renderizador ligero de Markdown para mensajes del chat.
 * Maneja: tablas, negritas, cursivas, listas, saltos de línea.
 * No agrega dependencias externas.
 */
export default function MarkdownMessage({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => (
        <div key={i}>{renderBlock(block)}</div>
      ))}
    </div>
  );
}

type Block =
  | { type: "paragraph"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

function parseBlocks(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Detectar tabla Markdown (línea con | y siguiente con |---|)
    if (
      line.trim().startsWith("|") &&
      i + 1 < lines.length &&
      lines[i + 1].trim().match(/^\|[\s\-:|]+\|/)
    ) {
      const headers = parseCells(line);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(parseCells(lines[i]));
        i++;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    // Línea vacía — skip
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Acumular párrafo
    let paragraph = line;
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("|") &&
      !lines[i].trim().match(/^\|[\s\-:|]+\|/)
    ) {
      paragraph += "\n" + lines[i];
      i++;
    }
    blocks.push({ type: "paragraph", text: paragraph });
  }

  return blocks;
}

function parseCells(line: string): string[] {
  return line
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 0 && !cell.match(/^[\-:]+$/));
}

function renderBlock(block: Block) {
  if (block.type === "table") {
    return (
      <div className="overflow-x-auto my-2">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200">
              {block.headers.map((h, i) => (
                <th
                  key={i}
                  className="px-2 py-1.5 text-left font-semibold text-zinc-700 bg-zinc-50"
                >
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-zinc-100 last:border-0">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-2 py-1.5 text-zinc-600">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Paragraph
  return <p className="leading-relaxed">{renderInline(block.text)}</p>;
}

function renderInline(text: string): React.ReactNode {
  // Procesar negritas, cursivas y texto normal
  const parts: React.ReactNode[] = [];
  // Regex para **bold**, *italic*, y texto normal
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|([^*]+)/g;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // Bold
      parts.push(
        <strong key={key++} className="font-semibold text-zinc-800">
          {match[2]}
        </strong>
      );
    } else if (match[4]) {
      // Italic
      parts.push(
        <em key={key++} className="italic">
          {match[4]}
        </em>
      );
    } else if (match[5]) {
      // Plain text
      parts.push(<span key={key++}>{match[5]}</span>);
    }
  }

  return parts.length > 0 ? parts : text;
}
