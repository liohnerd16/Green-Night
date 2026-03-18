import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { GripVertical } from "lucide-react";
import { WebsiteItem } from "./WebsiteItem";

const ITEM_TYPE = "WEBSITE";

export function DraggableWebsiteItem({
  website,
  index,
  viewMode,
  isFavorite,
  categories,
  onVote,
  onRate,
  onToggleFavorite,
  onUpdate,
  onDelete,
  showAdminActions,
  onMoveItem,
  isDragEnabled,
}) {
  const ref = useRef(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: () => ({ id: website.id, index }),
    canDrag: isDragEnabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ITEM_TYPE,
    canDrop: () => isDragEnabled,
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMoveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className={`relative transition-all duration-200 ${
        isDragging
          ? "opacity-30 scale-95"
          : isOver && canDrop
          ? "ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-gray-950 rounded-lg"
          : ""
      }`}
    >
      {isDragEnabled && (
        <div
          ref={drag}
          className={`absolute z-10 flex items-center justify-center cursor-grab active:cursor-grabbing transition-all ${
            viewMode === "list"
              ? "left-1 top-1/2 -translate-y-1/2 w-6 h-8"
              : "left-1.5 top-1.5 w-7 h-7 rounded-md bg-white/90 dark:bg-gray-800/90 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300"
          }`}
          title="Kéo để sắp xếp"
        >
          <GripVertical className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
      )}
      <div className={isDragEnabled && viewMode !== "list" ? "ml-0" : ""}>
        <WebsiteItem
          website={website}
          viewMode={viewMode}
          isFavorite={isFavorite}
          categories={categories}
          onVote={onVote}
          onRate={onRate}
          onToggleFavorite={onToggleFavorite}
          onUpdate={onUpdate}
          onDelete={onDelete}
          showAdminActions={showAdminActions}
        />
      </div>
    </div>
  );
}