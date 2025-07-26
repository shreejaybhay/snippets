const AchievementCard: React.FC<{
  achievement: Achievement;
  index: number;
}> = ({ achievement, index }) => {
  const Icon = achievement.icon;
  
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      className="h-full"
    >
      <Card className={cn(
        "overflow-hidden dark:bg-[#161514] group hover:shadow-lg transition-all duration-300 h-full flex flex-col",
        achievement.progress === 100 && "border-emerald-500/50"
      )}>
        <CardContent className="p-6 flex flex-col flex-1">
          <div className="flex flex-col h-full justify-between space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "p-3 rounded-xl transition-colors duration-300",
                  `bg-${achievement.color}-500/10 group-hover:bg-${achievement.color}-500/20`
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-emerald-500 transition-colors">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
              </div>
              
              <Badge variant="outline" className={cn(
                "text-xs",
                achievement.progress === 100 ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10"
              )}>
                {achievement.progress === 100 ? "Completed" : "In Progress"}
              </Badge>
            </div>

            {/* Progress */}
            {achievement.criteria.type !== 'boolean' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>{achievement.progress}%</span>
                </div>
                <ProgressBar 
                  progress={achievement.progress} 
                  color={achievement.color}
                />
                {achievement.current !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    {achievement.current} / {achievement.target}
                  </p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-sm pt-2">
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  achievement.rarity === 'Legendary' && "bg-yellow-500/10 text-yellow-500"
                )}
              >
                {achievement.rarity}
              </Badge>
              {achievement.unlockedAt && (
                <time className="text-xs text-muted-foreground">
                  Earned {formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })}
                </time>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
