import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Search, Filter, Calendar, DollarSign, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Grants() {
  const [status, setStatus] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: grants, isLoading } = trpc.grants.list.useQuery({
    status: status || undefined,
    category: category || undefined,
  });

  const filteredGrants = grants?.filter(
    (grant) =>
      grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Available Grants</h1>
          <p className="text-slate-600">Browse and apply for grants in your community</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" /> Filters
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="awarded">Awarded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="Community">Community</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Education">Education</option>
                    <option value="Environment">Environment</option>
                    <option value="Health">Health</option>
                  </select>
                </div>

                <Button
                  onClick={() => {
                    setStatus("");
                    setCategory("");
                    setSearchTerm("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search grants by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Grants List */}
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-48 rounded-lg" />
                ))
              ) : filteredGrants.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-slate-600 text-lg">No grants found matching your criteria.</p>
                </div>
              ) : (
                filteredGrants.map((grant) => (
                  <Link key={grant.id} href={`/grants/${grant.id}`}>
                    <a className="block">
                      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-semibold text-slate-900 hover:text-blue-600">
                            {grant.title}
                          </h3>
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {grant.status}
                          </span>
                        </div>

                        <p className="text-slate-600 mb-4 line-clamp-2">{grant.description}</p>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold">${Number(grant.budget).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="w-4 h-4" />
                            <span>{grant.category}</span>
                          </div>
                          {grant.closing_date && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(grant.closing_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </a>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
