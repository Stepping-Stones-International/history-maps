# Coverage must be started before any application code is loaded.
require "simplecov"

SimpleCov.start "rails" do
  # Framework scaffolding with no behaviour of our own.
  skip "app/channels"
  skip "app/jobs/application_job.rb"
  skip "app/mailers/application_mailer.rb"

  # The benchmark: the suite fails if line coverage drops below this.
  minimum_coverage 90
end

ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "inertia_rails/minitest"
require_relative "test_helpers/session_test_helper"

module ActiveSupport
  class TestCase
    # Single worker so SimpleCov sees every line in one process; the suite is
    # small enough that parallelism buys nothing.
    parallelize(workers: 1)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
  end
end
