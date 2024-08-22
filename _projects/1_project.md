layout: page
title: Layout-Agnostic Human Activity Recognition
description: Exploring the TDOST approach in Smart Homes
img: assets/img/tdost_overview.png
importance: 1
category: research
related_publications: thukral2024layoutagnostic, dhekane2024layoutagnostic
In this project, we present a novel approach to Human Activity Recognition (HAR) in smart homes, focusing on a layout-agnostic method using Textual Descriptions of Sensor Triggers (TDOST). This methodology allows for the transfer of HAR models across different homes without retraining, by leveraging natural language processing.

Key Contributions
TDOST Methodology: We convert raw sensor data into textual descriptions that are independent of the specific layout and sensor configuration of individual homes.
Cross-Home Generalization: The model trained with TDOST can be applied to different homes without adaptation, ensuring high accuracy and efficiency.
Use of Pre-trained Language Models: The system utilizes the rich representational capacity of pre-trained language models to handle textual embeddings of sensor data.
Visual Overview of the Approach
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/tdost_overview.png" title="TDOST Overview" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/architecture.png" title="System Architecture" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/results_comparison.png" title="Results Comparison" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Left: Overview of the TDOST approach. Middle: System architecture for layout-agnostic HAR. Right: Performance comparison across various models and configurations.
</div>
System Architecture
Our approach follows a structured architecture that begins with converting sensor triggers into natural language descriptions. These are then processed using pre-trained language models, which map them into a textual embedding space. The final classification is performed using a deep neural network that can generalize across different home layouts.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/LayoutAgnosticMethod.jpg" title="Training and Inference Pipeline" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    The training and inference pipeline used in the TDOST-based HAR system.
</div>
Experimental Results
Our experimental setup tested the effectiveness of TDOST-based HAR models across multiple smart home datasets. The results demonstrate that our approach significantly outperforms traditional methods, especially in transfer scenarios where the model is applied to a new environment without any retraining.

<div class="row justify-content-sm-center">
    <div class="col-sm-8 mt-3 mt-md-0">
        {% include figure.html path="assets/img/tdost_results.png" title="Experimental Results" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm-4 mt-3 mt-md-0">
        {% include figure.html path="assets/img/dataset.png" title="Dataset Overview" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Left: Performance metrics across different datasets. Right: Overview of datasets used in the experiments.
</div>
Conclusion
This project demonstrates the potential of TDOST to create robust, layout-agnostic HAR systems that can be easily deployed across different smart home environments. By leveraging the power of natural language processing, we can overcome the limitations of traditional HAR models and pave the way for more generalizable solutions.