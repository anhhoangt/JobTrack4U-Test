/**
 * =====================================================
 * PAGE OBJECTS INDEX
 * =====================================================
 *
 * Central export file for all page objects
 */

const BasePage = require('./BasePage');
const AuthPage = require('./AuthPage');
const DashboardPage = require('./DashboardPage');
const NavigationComponent = require('./NavigationComponent');
const JobsPage = require('./JobsPage');
const AddJobPage = require('./AddJobPage');
const ActivitiesPage = require('./ActivitiesPage');
const TimelinePage = require('./TimelinePage');

module.exports = {
  BasePage,
  AuthPage,
  DashboardPage,
  NavigationComponent,
  JobsPage,
  AddJobPage,
  ActivitiesPage,
  TimelinePage
};
