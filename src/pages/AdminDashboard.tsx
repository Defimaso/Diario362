import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import ClientCard from "@/components/ClientCard";
import { getMockClients, Client } from "@/lib/storage";
import { cn } from "@/lib/utils";

type FilterStatus = 'all' | 'green' | 'yellow' | 'red';

const AdminDashboard = () => {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const clients = getMockClients();

  const filteredClients = filter === 'all' 
    ? clients 
    : clients.filter(c => c.status === filter);

  const statusCounts = {
    green: clients.filter(c => c.status === 'green').length,
    yellow: clients.filter(c => c.status === 'yellow').length,
    red: clients.filter(c => c.status === 'red').length,
  };

  const filterButtons: { id: FilterStatus; label: string; count?: number }[] = [
    { id: 'all', label: 'All', count: clients.length },
    { id: 'green', label: 'Stable', count: statusCounts.green },
    { id: 'yellow', label: 'Alert', count: statusCounts.yellow },
    { id: 'red', label: 'Urgent', count: statusCounts.red },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-4">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Coach Dashboard</h1>
            <p className="text-sm text-muted-foreground">Traffic Light System</p>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elegant rounded-xl p-4 text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-success/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div className="text-2xl font-bold text-success">{statusCounts.green}</div>
            <div className="text-xs text-muted-foreground">Stable</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-elegant rounded-xl p-4 text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-warning/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-warning" />
            </div>
            <div className="text-2xl font-bold text-warning">{statusCounts.yellow}</div>
            <div className="text-xs text-muted-foreground">Alert</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-elegant rounded-xl p-4 text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div className="text-2xl font-bold text-destructive">{statusCounts.red}</div>
            <div className="text-xs text-muted-foreground">Urgent</div>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filterButtons.map((btn) => (
            <motion.button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
                filter === btn.id
                  ? "bg-primary text-primary-foreground teal-glow"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {btn.label}
              {btn.count !== undefined && (
                <span className="ml-2 opacity-70">({btn.count})</span>
              )}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Client List */}
      <section className="px-5 pb-8">
        <div className="space-y-3">
          {filteredClients.map((client, idx) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <ClientCard client={client} />
            </motion.div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-foreground"
          >
            No clients in this category
          </motion.div>
        )}
      </section>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pb-8 text-center"
      >
        <span className="text-sm gradient-text font-bold">362°</span>
        <span className="text-sm text-muted-foreground ml-1">Navigator • Coach View</span>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
