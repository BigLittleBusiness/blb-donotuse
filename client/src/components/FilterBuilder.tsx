import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Save } from "lucide-react";

export interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicalOperator: "AND" | "OR";
}

interface FilterBuilderProps {
  onSave?: (filters: FilterCondition[]) => void;
  onApply?: (filters: FilterCondition[]) => void;
  initialFilters?: FilterCondition[];
}

const FILTER_FIELDS = [
  { value: "status", label: "Status" },
  { value: "category", label: "Category" },
  { value: "budget_min", label: "Budget (Min)" },
  { value: "budget_max", label: "Budget (Max)" },
  { value: "opening_date", label: "Opening Date" },
  { value: "closing_date", label: "Closing Date" },
  { value: "council_id", label: "Council" },
  { value: "title", label: "Title" },
];

const OPERATORS = {
  text: [
    { value: "contains", label: "Contains" },
    { value: "equals", label: "Equals" },
    { value: "starts_with", label: "Starts With" },
    { value: "ends_with", label: "Ends With" },
  ],
  number: [
    { value: "equals", label: "Equals" },
    { value: "greater_than", label: "Greater Than" },
    { value: "less_than", label: "Less Than" },
    { value: "between", label: "Between" },
  ],
  date: [
    { value: "equals", label: "Equals" },
    { value: "before", label: "Before" },
    { value: "after", label: "After" },
    { value: "between", label: "Between" },
  ],
  select: [
    { value: "equals", label: "Equals" },
    { value: "in", label: "In" },
  ],
};

const STATUS_OPTIONS = ["draft", "open", "closed", "awarded", "completed"];
const CATEGORY_OPTIONS = ["Infrastructure", "Education", "Environment", "Healthcare", "Economic Development", "Arts & Culture", "Social Services", "Recreation"];

export default function FilterBuilder({ onSave, onApply, initialFilters = [] }: FilterBuilderProps) {
  const [filters, setFilters] = useState<FilterCondition[]>(
    initialFilters.length > 0
      ? initialFilters
      : [
          {
            id: "1",
            field: "status",
            operator: "equals",
            value: "",
            logicalOperator: "AND",
          },
        ]
  );

  const [filterName, setFilterName] = useState("");
  const [filterDescription, setFilterDescription] = useState("");

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      field: "status",
      operator: "equals",
      value: "",
      logicalOperator: "AND",
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (id: string) => {
    if (filters.length > 1) {
      setFilters(filters.filter((f) => f.id !== id));
    }
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const getOperatorsForField = (field: string) => {
    if (field.includes("date")) return OPERATORS.date;
    if (field.includes("budget")) return OPERATORS.number;
    if (field === "status" || field === "category") return OPERATORS.select;
    return OPERATORS.text;
  };

  const getValuesForField = (field: string) => {
    if (field === "status") return STATUS_OPTIONS;
    if (field === "category") return CATEGORY_OPTIONS;
    return [];
  };

  const handleApply = () => {
    if (onApply) {
      onApply(filters);
    }
  };

  const handleSave = () => {
    if (onSave && filterName.trim()) {
      onSave(filters);
      setFilterName("");
      setFilterDescription("");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Build Your Filter</h3>
          </div>

          {/* Filter Conditions */}
          <div className="space-y-3">
            {filters.map((filter, index) => (
              <div key={filter.id} className="flex items-end gap-2">
                {index > 0 && (
                  <div className="w-12 text-center">
                    <span className="text-sm font-medium text-gray-600">{filter.logicalOperator}</span>
                  </div>
                )}
                <Select value={filter.field} onValueChange={(value) => updateFilter(filter.id, { field: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTER_FIELDS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filter.operator} onValueChange={(value) => updateFilter(filter.id, { operator: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {getOperatorsForField(filter.field).map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {getValuesForField(filter.field).length > 0 ? (
                  <Select value={filter.value} onValueChange={(value) => updateFilter(filter.id, { value })}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      {getValuesForField(filter.field).map((val) => (
                        <SelectItem key={val} value={val}>
                          {val}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={filter.field.includes("date") ? "date" : filter.field.includes("budget") ? "number" : "text"}
                    placeholder="Enter value"
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                    className="flex-1"
                  />
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFilter(filter.id)}
                  disabled={filters.length === 1}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add Filter Button */}
          <Button onClick={addFilter} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Condition
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleApply} className="flex-1">
              Apply Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Save Filter Section */}
      <Card className="p-6">
        <div className="space-y-3">
          <h3 className="font-semibold">Save This Filter</h3>
          <Input
            placeholder="Filter name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
          <Input
            placeholder="Description (optional)"
            value={filterDescription}
            onChange={(e) => setFilterDescription(e.target.value)}
          />
          <Button onClick={handleSave} disabled={!filterName.trim()} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Filter
          </Button>
        </div>
      </Card>
    </div>
  );
}
