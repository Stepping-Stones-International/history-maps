InertiaRails.configure do |config|
  # @inertiajs/core v3 reads the initial page only from a
  # <script type="application/json"> element; the legacy data-page attribute on
  # the root div is ignored, which leaves the app silently unmounted.
  config.use_script_element_for_initial_page = true

  # Opt in to the InertiaRails 4.0 behaviour: every response carries an errors
  # hash, so form components can read props.errors unconditionally.
  config.always_include_errors_hash = true
end
