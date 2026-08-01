class NodesController < ApplicationController
  before_action :set_topic

  def create
    node = @topic.nodes.new(node_params)
    log_save("create.attempt", node)

    if node.save
      log_save("create.saved", node)
      redirect_to edit_topic_path(@topic), notice: "Node added."
    else
      log_save("create.failed", node)
      redirect_to edit_topic_path(@topic),
        alert: "That node could not be saved.", inertia: { errors: node.errors }
    end
  end

  def update
    node = @topic.nodes.find(params[:id])
    log_save("update.before", node)
    node.assign_attributes(node_params)
    log_save("update.assigned", node)

    if node.save
      log_save("update.saved", node.reload)
      redirect_to edit_topic_path(@topic), notice: "Node updated."
    else
      log_save("update.failed", node)
      redirect_to edit_topic_path(@topic),
        alert: "That node could not be saved.", inertia: { errors: node.errors }
    end
  end

  private
    def set_topic
      @topic = Current.user.topics.find(params[:topic_id])
    end

    # Inertia forms post a flat payload.
    def node_params
      params.permit(
        :date_type, :occurred_month, :occurred_day, :occurred_year, :era,
        :title, :description, :latitude, :longitude
      )
    end

    # TEMPORARY: tracing a report that node edits do not persist.
    # Remove with DiagnosticsController.
    def log_save(stage, node)
      Rails.logger.info("[NODE-SAVE] " + {
        stage: stage,
        method: request.request_method,
        path: request.path,
        node_id: node.id,
        raw_body: request.raw_post,
        permitted: node_params.to_h,
        attributes: node.attributes.slice(
          "date_type", "occurred_year", "occurred_month", "occurred_day",
          "era", "title", "latitude", "longitude"
        ),
        changes: node.changes,
        errors: node.errors.full_messages
      }.to_json)
    end
end
