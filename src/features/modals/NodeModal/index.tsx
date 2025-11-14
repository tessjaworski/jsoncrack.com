import React, { useState } from "react";
import type { ModalProps } from "@mantine/core";
import { Modal, Stack, Text, ScrollArea, Flex, CloseButton, Button, Textarea } from "@mantine/core";
import { CodeHighlight } from "@mantine/code-highlight";
import type { NodeData } from "../../../types/graph";
import useGraph from "../../editor/views/GraphView/stores/useGraph";

// return object from json removing array and object fields
const normalizeNodeData = (nodeRows: NodeData["text"]) => {
  if (!nodeRows || nodeRows.length === 0) return "{}";
  if (nodeRows.length === 1 && !nodeRows[0].key) return `${nodeRows[0].value}`;

  const obj = {};
  nodeRows?.forEach(row => {
    if (row.type !== "array" && row.type !== "object") {
      if (row.key) obj[row.key] = row.value;
    }
  });
  return JSON.stringify(obj, null, 2);
};

// return json path in the format $["customer"]
const jsonPathToString = (path?: NodeData["path"]) => {
  if (!path || path.length === 0) return "$";
  const segments = path.map(seg => (typeof seg === "number" ? seg : `"${seg}"`));
  return `$[${segments.join("][")}]`;
};

export const NodeModal = ({ opened, onClose }: ModalProps) => {
  const nodeData = useGraph(state => state.selectedNode);
  const updateNodeFields = useGraph(state => state.updateNodeFields);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");

  // load initial content when entering edit mode
  const startEdit = () => {
    setDraft(normalizeNodeData(nodeData?.text ?? []));
    setIsEditing(true);
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(draft);
      updateNodeFields(nodeData!.id, parsed);
      setIsEditing(false);
    } catch (err) {
      alert("Invalid JSON");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Modal size="auto" opened={opened} onClose={onClose} centered withCloseButton={false}>
      <Stack pb="sm" gap="sm">
        <Stack gap="xs">
          <Flex justify="space-between" align="center">
            <Text fz="xs" fw={500}>Content</Text>
            <CloseButton onClick={onClose} />
          </Flex>

          {!isEditing && (
            <>
              <ScrollArea.Autosize mah={250} maw={600}>
                <CodeHighlight
                  code={normalizeNodeData(nodeData?.text ?? [])}
                  miw={350}
                  maw={600}
                  language="json"
                  withCopyButton
                />
              </ScrollArea.Autosize>
              <Button size="xs" variant="light" onClick={startEdit}>
                Edit
              </Button>
            </>
          )}

          {isEditing && (
            <>
              <Textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                minRows={8}
                miw={350}
                maw={600}
                autosize
              />
              <Flex gap="sm">
                <Button size="xs" onClick={handleSave}>
                  Save
                </Button>
                <Button size="xs" variant="default" onClick={handleCancel}>
                  Cancel
                </Button>
              </Flex>
            </>
          )}
        </Stack>

        <Text fz="xs" fw={500}>JSON Path</Text>
        <ScrollArea.Autosize maw={600}>
          <CodeHighlight
            code={jsonPathToString(nodeData?.path)}
            miw={350}
            mah={250}
            language="json"
            withCopyButton
          />
        </ScrollArea.Autosize>
      </Stack>
    </Modal>
  );
};
