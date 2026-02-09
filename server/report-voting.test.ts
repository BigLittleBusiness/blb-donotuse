import { describe, it, expect } from "vitest";
import * as dbReports from "./db-reports";

describe("Report Voting Integration", () => {
  describe("Monthly Report with Voting Data", () => {
    it("should generate monthly report with voting statistics", async () => {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const lgaId = 10050; // Albury

      const report = await dbReports.getLGAMonthlyReport(lgaId, year, month);

      expect(report).toBeDefined();
      if (report) {
        // Verify report structure
        expect(report.lga).toBeDefined();
        expect(report.lga.id).toBe(lgaId);
        expect(report.period).toBeDefined();

        // Verify voting data structure
        expect(report.communityVoting).toBeDefined();
        expect(typeof report.communityVoting.totalVotes).toBe("number");
        expect(typeof report.communityVoting.supportVotes).toBe("number");
        expect(typeof report.communityVoting.opposeVotes).toBe("number");
        expect(typeof report.communityVoting.neutralVotes).toBe("number");
      }
    });

    it("should include voting percentages in report", async () => {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const lgaId = 10050;

      const report = await dbReports.getLGAMonthlyReport(lgaId, year, month);

      if (report && report.communityVoting.totalVotes > 0) {
        // Verify percentages are valid
        expect(report.communityVoting.supportPercentage).toBeGreaterThanOrEqual(0);
        expect(report.communityVoting.supportPercentage).toBeLessThanOrEqual(100);
        expect(report.communityVoting.opposePercentage).toBeGreaterThanOrEqual(0);
        expect(report.communityVoting.opposePercentage).toBeLessThanOrEqual(100);
        expect(report.communityVoting.neutralPercentage).toBeGreaterThanOrEqual(0);
        expect(report.communityVoting.neutralPercentage).toBeLessThanOrEqual(100);

        // Verify percentages add up to 100% (allowing for rounding)
        const totalPercentage =
          report.communityVoting.supportPercentage +
          report.communityVoting.opposePercentage +
          report.communityVoting.neutralPercentage;

        expect(totalPercentage).toBeGreaterThanOrEqual(99);
        expect(totalPercentage).toBeLessThanOrEqual(101);
      }
    });

    it("should include voting data for individual grants", async () => {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const lgaId = 10050;

      const report = await dbReports.getLGAMonthlyReport(lgaId, year, month);

      if (report && report.grantDetails && report.grantDetails.length > 0) {
        // Check first grant with voting data
        const grantWithVoting = report.grantDetails.find((g: any) => g.voting && g.voting.totalVotes > 0);

        if (grantWithVoting) {
          expect(grantWithVoting.voting).toBeDefined();
          expect(typeof grantWithVoting.voting.totalVotes).toBe("number");
          expect(typeof grantWithVoting.voting.supportVotes).toBe("number");
          expect(typeof grantWithVoting.voting.opposeVotes).toBe("number");
          expect(typeof grantWithVoting.voting.neutralVotes).toBe("number");
          expect(typeof grantWithVoting.voting.supportPercentage).toBe("number");
          expect(typeof grantWithVoting.voting.opposePercentage).toBe("number");
          expect(typeof grantWithVoting.voting.neutralPercentage).toBe("number");
        }
      }
    });

    it("should handle reports with no votes gracefully", async () => {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const lgaId = 10050;

      const report = await dbReports.getLGAMonthlyReport(lgaId, year, month);

      if (report) {
        // Should have voting structure even with no votes
        expect(report.communityVoting).toBeDefined();
        expect(report.communityVoting.totalVotes).toBeGreaterThanOrEqual(0);
        expect(report.communityVoting.supportPercentage).toBeGreaterThanOrEqual(0);
        expect(report.communityVoting.opposePercentage).toBeGreaterThanOrEqual(0);
        expect(report.communityVoting.neutralPercentage).toBeGreaterThanOrEqual(0);
      }
    });

    it("should maintain data integrity across all metrics", async () => {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const lgaId = 10050;

      const report = await dbReports.getLGAMonthlyReport(lgaId, year, month);

      if (report) {
        // Verify application metrics are valid
        expect(report.totalApplications).toBeGreaterThanOrEqual(0);
        expect(report.approvedApplications).toBeGreaterThanOrEqual(0);
        expect(report.rejectedApplications).toBeGreaterThanOrEqual(0);
        expect(report.successRate).toBeGreaterThanOrEqual(0);
        expect(report.successRate).toBeLessThanOrEqual(100);

        // Verify funding metrics are valid
        expect(report.totalFundingAllocated).toBeGreaterThanOrEqual(0);
        expect(report.totalFundingAwarded).toBeGreaterThanOrEqual(0);

        // Verify voting metrics are valid
        expect(report.communityVoting.totalVotes).toBeGreaterThanOrEqual(0);
        expect(report.communityVoting.supportVotes).toBeGreaterThanOrEqual(0);
        expect(report.communityVoting.opposeVotes).toBeGreaterThanOrEqual(0);
        expect(report.communityVoting.neutralVotes).toBeGreaterThanOrEqual(0);
      }
    });

    it("should include grant details with all metrics", async () => {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const lgaId = 10050;

      const report = await dbReports.getLGAMonthlyReport(lgaId, year, month);

      if (report && report.grantDetails && report.grantDetails.length > 0) {
        const grant = report.grantDetails[0];

        // Verify grant structure
        expect(grant.grantId).toBeDefined();
        expect(grant.title).toBeDefined();
        expect(grant.category).toBeDefined();
        expect(grant.budget).toBeGreaterThanOrEqual(0);

        // Verify application metrics
        expect(typeof grant.totalApplications).toBe("number");
        expect(typeof grant.approvedApplications).toBe("number");
        expect(typeof grant.successRate).toBe("number");

        // Verify voting data is present (even if zero)
        expect(grant.voting).toBeDefined();
        expect(typeof grant.voting.totalVotes).toBe("number");
        expect(typeof grant.voting.supportPercentage).toBe("number");
      }
    });

    it("should calculate voting percentages correctly", async () => {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const lgaId = 10050;

      const report = await dbReports.getLGAMonthlyReport(lgaId, year, month);

      if (report && report.communityVoting.totalVotes > 0) {
        // Verify vote counts match percentages
        const supportMatch =
          report.communityVoting.totalVotes > 0
            ? Math.round((report.communityVoting.supportVotes / report.communityVoting.totalVotes) * 100)
            : 0;
        const opposeMatch =
          report.communityVoting.totalVotes > 0
            ? Math.round((report.communityVoting.opposeVotes / report.communityVoting.totalVotes) * 100)
            : 0;
        const neutralMatch =
          report.communityVoting.totalVotes > 0
            ? Math.round((report.communityVoting.neutralVotes / report.communityVoting.totalVotes) * 100)
            : 0;

        expect(report.communityVoting.supportPercentage).toBe(supportMatch);
        expect(report.communityVoting.opposePercentage).toBe(opposeMatch);
        expect(report.communityVoting.neutralPercentage).toBe(neutralMatch);
      }
    });
  });
});
