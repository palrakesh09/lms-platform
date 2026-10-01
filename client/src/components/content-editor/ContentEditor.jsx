import { useState } from "react";
import { BLOCK_TYPE_OPTIONS, emptyBlock } from "../../utils/contentBlocks.js";
import {
  secondaryButton,
  smallButton,
  smallDangerButton,
} from "../common/buttonClasses.js";
import Icon from "../common/Icon.jsx";
import ContentRenderer from "../content-renderer/ContentRenderer.jsx";
import BlockEditor from "./BlockEditor.jsx";
export default function ContentEditor({ blocks, onChange }) {
  const [mode, setMode] = useState("edit");
  const [pickerOpen, setPickerOpen] = useState(false);
  const updateBlock = (index, next) =>
    onChange(blocks.map((b, i) => (i === index ? next : b)));
  const removeBlock = (index) => onChange(blocks.filter((_, i) => i !== index));
  const duplicateBlock = (index) => {
    const copy = {
      ...blocks[index],
      id: `${blocks[index].id ?? index}-copy-${Date.now()}`,
    };
    onChange([...blocks.slice(0, index + 1), copy, ...blocks.slice(index + 1)]);
  };
  const moveBlock = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const addBlock = (type) => {
    onChange([...blocks, emptyBlock(type)]);
    setPickerOpen(false);
  };
  return (
    <div className="space-y-4 border border-[#2A2A2A] bg-[#111111] p-3 sm:p-4">
      {" "}
      {/* Header */}{" "}
      <div className=" flex flex-col gap-3 border-b border-[#2A2A2A] pb-3 sm:flex-row sm:items-center sm:justify-between ">
        {" "}
        <div>
          {" "}
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#FF3E00]">
            {" "}
            Content editor{" "}
          </p>{" "}
          <h4 className="mt-1 text-sm font-semibold text-white">
            {" "}
            Build lesson content{" "}
          </h4>{" "}
        </div>{" "}
        <div
          role="group"
          aria-label="Editor mode"
          className="grid w-full grid-cols-2 border border-[#2A2A2A] bg-[#0A0A0A] p-1 sm:inline-flex sm:w-auto sm:grid-cols-none"
        >
          {" "}
          <button
            type="button"
            onClick={() => setMode("edit")}
            aria-pressed={mode === "edit"}
            className={[
              "min-h-9 px-3",
              "font-mono text-[10px] font-bold uppercase tracking-wider",
              "transition-all",
              mode === "edit"
                ? "bg-[#FF3E00] text-white"
                : "text-neutral-500 hover:bg-[#171717] hover:text-white",
            ].join(" ")}
          >
            {" "}
            Edit{" "}
          </button>{" "}
          <button
            type="button"
            onClick={() => setMode("preview")}
            aria-pressed={mode === "preview"}
            className={[
              "min-h-9 px-3",
              "font-mono text-[10px] font-bold uppercase tracking-wider",
              "transition-all",
              mode === "preview"
                ? "bg-[#FF3E00] text-white"
                : "text-neutral-500 hover:bg-[#171717] hover:text-white",
            ].join(" ")}
          >
            {" "}
            Preview{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {/* Preview */}{" "}
      {mode === "preview" ? (
        blocks.length === 0 ? (
          <div className="border border-dashed border-[#2A2A2A] px-4 py-10 text-center">
            {" "}
            <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              {" "}
              Empty{" "}
            </p>{" "}
            <p className="mt-2 text-sm text-neutral-400">
              {" "}
              No content blocks yet.{" "}
            </p>{" "}
          </div>
        ) : (
          <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-4 sm:p-6">
            {" "}
            <ContentRenderer content={{ version: 1, blocks }} />{" "}
          </div>
        )
      ) : (
        <>
          {" "}
          {blocks.length === 0 && (
            <div className="border border-dashed border-[#2A2A2A] px-4 py-8 text-center">
              {" "}
              <p className="text-sm text-neutral-500">
                {" "}
                No content blocks yet.{" "}
              </p>{" "}
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-700">
                {" "}
                Add your first block below{" "}
              </p>{" "}
            </div>
          )}{" "}
          <ul className="space-y-3">
            {" "}
            {blocks.map((block, index) => (
              <li
                key={block.id ?? index}
                className="border border-[#2A2A2A] bg-[#0A0A0A] p-3 sm:p-4"
              >
                {" "}
                <div className=" mb-3 flex flex-col gap-2 border-b border-[#2A2A2A] pb-3 sm:flex-row sm:items-center sm:justify-between ">
                  {" "}
                  <div className="flex min-w-0 items-center gap-2">
                    {" "}
                    <span className=" flex size-6 shrink-0 items-center justify-center bg-[#FF3E00] font-mono text-[9px] font-bold text-white ">
                      {" "}
                      {String(index + 1).padStart(2, "0")}{" "}
                    </span>{" "}
                    <span className="truncate font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      {" "}
                      {block.type.replace("-", " ")}{" "}
                    </span>{" "}
                  </div>{" "}
                  <div className="flex flex-wrap gap-1">
                    {" "}
                    <button
                      type="button"
                      onClick={() => moveBlock(index, -1)}
                      disabled={index === 0}
                      aria-label="Move block up"
                      className={smallButton}
                    >
                      {" "}
                      <Icon
                        name="chevron-right"
                        className="size-3.5 -rotate-90"
                      />{" "}
                    </button>{" "}
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 1)}
                      disabled={index === blocks.length - 1}
                      aria-label="Move block down"
                      className={smallButton}
                    >
                      {" "}
                      <Icon
                        name="chevron-right"
                        className="size-3.5 rotate-90"
                      />{" "}
                    </button>{" "}
                    <button
                      type="button"
                      onClick={() => duplicateBlock(index)}
                      className={smallButton}
                    >
                      {" "}
                      Duplicate{" "}
                    </button>{" "}
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      aria-label="Delete block"
                      className={smallDangerButton}
                    >
                      {" "}
                      <Icon name="trash" className="size-3.5" />{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
                <BlockEditor
                  block={block}
                  onChange={(next) => updateBlock(index, next)}
                />{" "}
              </li>
            ))}{" "}
          </ul>{" "}
          <div className="relative">
            {" "}
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              aria-expanded={pickerOpen}
              className={secondaryButton}
            >
              {" "}
              <Icon name="plus" className="size-4" /> Add Content{" "}
            </button>{" "}
            {pickerOpen && (
              <div
                role="menu"
                className=" absolute left-0 z-20 mt-2 grid w-full max-w-sm grid-cols-1 gap-1 border border-[#2A2A2A] bg-[#111111] p-2 shadow-2xl sm:grid-cols-2 "
              >
                {" "}
                {BLOCK_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitem"
                    onClick={() => addBlock(option.value)}
                    className=" min-h-10 px-3 py-2 text-left text-sm text-neutral-300 transition-colors hover:bg-[#171717] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#FF3E00] "
                  >
                    {" "}
                    {option.label}{" "}
                  </button>
                ))}{" "}
              </div>
            )}{" "}
          </div>{" "}
        </>
      )}{" "}
    </div>
  );
}
