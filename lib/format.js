// Javascript functions for Topics course format

M.course = M.course || {};

M.course.format = M.course.format || {};

/**
 * Describe the section configuration
 *
 * The section structure is:
 *   <div class="region-content">
 *     <div>
 *       <div class="sitetopic">...</div>
 *     </div>
 *   </div>
 *
 * @return {object} section list configuration
 */
M.course.format.get_config = function() {
    return {
        container_node : 'div',
        container_class : 'region-content',
        section_node : 'div',
        section_class : 'sitetopic'
    };
};
