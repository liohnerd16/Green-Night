import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { WebsiteActions } from "./WebsiteActions";
import { EditWebsiteDialog } from "./EditWebsiteDialog";

export function WebsiteItem({ 
  website, 
  viewMode, 
  isFavorite,
  categories,
  onVote,
  onRate,
  onToggleFavorite,
  onUpdate,
  onDelete,
  showAdminActions = false,
}) {
  const votes = website.votes || { up: 0, down: 0 };
  const averageRating = website.averageRating || 0;
  const totalRatings = website.ratings?.length || 0;

  if (viewMode === "list") {
    return (
      <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="p-4 flex items-start gap-4">
          <div className="text-3xl flex-shrink-0">{website.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="font-semibold text-gray-900 dark:text-gray-100 truncate"
              >
                {website.name}
              </span>
              {showAdminActions && (
                <EditWebsiteDialog
                  website={website}
                  categories={categories}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              {website.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                {website.category}
              </Badge>
              {website.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <WebsiteActions
              websiteId={website.id}
              websiteName={website.name}
              websiteUrl={website.url}
              votes={votes}
              averageRating={averageRating}
              totalRatings={totalRatings}
              isFavorite={isFavorite}
              onVote={(type) => onVote(website.id, type)}
              onRate={(rating, comment) => onRate(website.id, rating, comment)}
              onToggleFavorite={() => onToggleFavorite(website.id)}
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all">
        <div className="flex justify-between items-start mb-3">
          <div className="text-3xl">{website.icon}</div>
          {showAdminActions && (
            <EditWebsiteDialog
              website={website}
              categories={categories}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          )}
        </div>
        <span
          className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2"
        >
          <span className="truncate">{website.name}</span>
        </span>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
          {website.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="secondary" className="text-xs">
            {website.category}
          </Badge>
        </div>
        <WebsiteActions
          websiteId={website.id}
          websiteName={website.name}
          websiteUrl={website.url}
          votes={votes}
          averageRating={averageRating}
          totalRatings={totalRatings}
          isFavorite={isFavorite}
          onVote={(type) => onVote(website.id, type)}
          onRate={(rating, comment) => onRate(website.id, rating, comment)}
          onToggleFavorite={() => onToggleFavorite(website.id)}
          compact={true}
        />
      </div>
    );
  }

  // Cards mode
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-center relative">
        <div className="text-5xl mb-2">{website.icon}</div>
        {showAdminActions && (
          <div className="absolute top-2 right-2">
            <EditWebsiteDialog
              website={website}
              categories={categories}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          </div>
        )}
      </div>
      <div className="p-4">
        <span
          className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2"
        >
          <span className="truncate">{website.name}</span>
        </span>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
          {website.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {website.category}
          </Badge>
          {website.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <WebsiteActions
          websiteId={website.id}
          websiteName={website.name}
          websiteUrl={website.url}
          votes={votes}
          averageRating={averageRating}
          totalRatings={totalRatings}
          isFavorite={isFavorite}
          onVote={(type) => onVote(website.id, type)}
          onRate={(rating, comment) => onRate(website.id, rating, comment)}
          onToggleFavorite={() => onToggleFavorite(website.id)}
        />
      </div>
    </Card>
  );
}