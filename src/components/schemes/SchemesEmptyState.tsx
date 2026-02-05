import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileQuestion, RefreshCw, Filter } from 'lucide-react';

interface SchemesEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export const SchemesEmptyState = ({ hasFilters, onClearFilters }: SchemesEmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="col-span-full"
    >
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6"
          >
            {hasFilters ? (
              <Filter className="w-10 h-10 text-primary" />
            ) : (
              <FileQuestion className="w-10 h-10 text-primary" />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2 mb-6"
          >
            <h3 className="text-xl font-semibold">
              {hasFilters ? 'No Schemes Match Your Filters' : 'No Schemes Available'}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {hasFilters
                ? 'Try adjusting your filters to see more opportunities, or clear all filters to view everything.'
                : 'There are no schemes available at the moment. Check back soon for new opportunities.'}
            </p>
          </motion.div>

          {hasFilters && onClearFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={onClearFilters}
                variant="outline"
                className="hover:bg-primary/10 hover:border-neon"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
