class NodesController < ApplicationController
  before_action :set_topic

  def create
    node = @topic.nodes.new(node_params)

    if node.save
      redirect_to edit_topic_path(@topic), notice: "Node added."
    else
      redirect_to edit_topic_path(@topic),
        alert: "That node could not be saved.", inertia: { errors: node.errors }
    end
  end

  def update
    node = @topic.nodes.find(params[:id])

    if node.update(node_params)
      redirect_to edit_topic_path(@topic), notice: "Node updated."
    else
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
        :title, :description, :latitude, :longitude, :parent_id, :position, :layer, :area_json, :polygon_color,
        :marker,
        :starts_type, :starts_year, :starts_month, :starts_day, :starts_era,
        :ends_type, :ends_year, :ends_month, :ends_day, :ends_era
      )
    end
end
