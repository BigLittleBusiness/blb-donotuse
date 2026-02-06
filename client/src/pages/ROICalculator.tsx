import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, DollarSign, Clock, Users } from "lucide-react";

export default function ROICalculator() {
  const [annualBudget, setAnnualBudget] = useState("500000");
  const [grantCount, setGrantCount] = useState("12");
  const [avgApplications, setAvgApplications] = useState("50");
  const [staffCost, setStaffCost] = useState("120000");

  const budget = parseFloat(annualBudget) || 0;
  const grants = parseFloat(grantCount) || 1;
  const applications = parseFloat(avgApplications) || 1;
  const staff = parseFloat(staffCost) || 0;

  // ROI Calculations
  const platformCost = 50000; // Annual platform cost
  const timePerApplication = 2; // Hours
  const hourlyRate = staff / 2000; // Assuming 2000 working hours per year
  const manualProcessingCost = applications * grants * timePerApplication * hourlyRate;
  const totalSavings = manualProcessingCost - platformCost;
  const roi = ((totalSavings / platformCost) * 100).toFixed(1);
  const paybackMonths = (platformCost / (totalSavings / 12)).toFixed(1);

  // Efficiency metrics
  const processingTimeReduction = 40; // Percentage
  const approvalRateImprovement = 15; // Percentage
  const communityEngagementIncrease = 60; // Percentage

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">ROI Calculator</h1>
          <p className="text-slate-600">Calculate the return on investment for GrantThrive in your council</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Your Council Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Annual Grant Budget ($)
                  </label>
                  <Input
                    type="number"
                    value={annualBudget}
                    onChange={(e) => setAnnualBudget(e.target.value)}
                    placeholder="500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number of Grants per Year
                  </label>
                  <Input
                    type="number"
                    value={grantCount}
                    onChange={(e) => setGrantCount(e.target.value)}
                    placeholder="12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Average Applications per Grant
                  </label>
                  <Input
                    type="number"
                    value={avgApplications}
                    onChange={(e) => setAvgApplications(e.target.value)}
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Annual Staff Cost ($)
                  </label>
                  <Input
                    type="number"
                    value={staffCost}
                    onChange={(e) => setStaffCost(e.target.value)}
                    placeholder="120000"
                  />
                </div>

                <Button className="w-full mt-6">Calculate ROI</Button>
              </div>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key ROI Metrics */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-700">Annual Savings</span>
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-900">${totalSavings.toLocaleString()}</p>
                <p className="text-xs text-green-700 mt-2">vs. manual processing</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">ROI</span>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-900">{roi}%</p>
                <p className="text-xs text-blue-700 mt-2">Return on investment</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700">Payback Period</span>
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-900">{paybackMonths} months</p>
                <p className="text-xs text-purple-700 mt-2">To recover investment</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-700">Total Applications</span>
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-orange-900">{(applications * grants).toLocaleString()}</p>
                <p className="text-xs text-orange-700 mt-2">Processed annually</p>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Cost Breakdown</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-slate-600">Manual Processing Cost</span>
                  <span className="font-semibold text-slate-900">${manualProcessingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-slate-600">GrantThrive Annual Cost</span>
                  <span className="font-semibold text-slate-900">${platformCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 bg-green-50 p-3 rounded-lg">
                  <span className="text-green-900 font-semibold">Net Annual Savings</span>
                  <span className="font-bold text-green-600 text-lg">${totalSavings.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            {/* Efficiency Improvements */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Expected Efficiency Improvements</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-700 font-medium">Processing Time Reduction</span>
                    <span className="text-green-600 font-bold">{processingTimeReduction}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${processingTimeReduction}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Faster application processing and reviews</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-700 font-medium">Approval Rate Improvement</span>
                    <span className="text-blue-600 font-bold">+{approvalRateImprovement}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${approvalRateImprovement * 5}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Better decision-making with analytics</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-700 font-medium">Community Engagement Increase</span>
                    <span className="text-purple-600 font-bold">+{communityEngagementIncrease}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.min(communityEngagementIncrease, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Increased transparency and participation</p>
                </div>
              </div>
            </Card>

            {/* Additional Benefits */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Additional Benefits</h2>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Improved transparency and public trust in grant distribution</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Real-time analytics and reporting for better decision-making</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Reduced manual errors and compliance risks</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Enhanced community engagement and participation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Scalable solution for growing grant portfolios</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
