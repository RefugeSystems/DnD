*** Script: Created Event: 5517c48f87243090afc976e7cebb35a2
Slow business rule 'Create Survey Records' on asmt_metric_type:<span class = "session-log-bold-text"> STS Help Desk Customer Satisfaction Survey</span>, time was: 0:00:00.484
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- asmt_assessable_record@metric_type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- sys_app_module@assessment
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- asmt_assessment_stat@metric_type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- sys_cs_survey@survey
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- asmt_m2m_recipientslist_survey@metric_type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- chat_survey@survey
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- survey_master@assessment
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- asmt_metric_type_group@metric_type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- asmt_decision_matrix@metric_type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- asmt_metric@metric_type
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0764488b87243090afc976e7cebb3593
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^69178c8f87243090afc976e7cebb352a'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0764488b87243090afc976e7cebb3593 <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0764488b87243090afc976e7cebb3593 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0764488b87243090afc976e7cebb3593 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0764488b87243090afc976e7cebb3593 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0764488b87243090afc976e7cebb3593 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0764488b87243090afc976e7cebb3593 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0764488b87243090afc976e7cebb3593 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0bd4277e87603090afc976e7cebb3572
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^21178c8f87243090afc976e7cebb3530'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0bd4277e87603090afc976e7cebb3572 <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0bd4277e87603090afc976e7cebb3572 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0bd4277e87603090afc976e7cebb3572 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0bd4277e87603090afc976e7cebb3572 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0bd4277e87603090afc976e7cebb3572 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0bd4277e87603090afc976e7cebb3572 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0bd4277e87603090afc976e7cebb3572 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0fd4a3be87603090afc976e7cebb357b
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Satisfaction</span>, time was: 0:00:00.223
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^69178c8f87243090afc976e7cebb3534'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0fd4a3be87603090afc976e7cebb357b <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0fd4a3be87603090afc976e7cebb357b <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0fd4a3be87603090afc976e7cebb357b <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0fd4a3be87603090afc976e7cebb357b <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0fd4a3be87603090afc976e7cebb357b <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0fd4a3be87603090afc976e7cebb357b <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0fd4a3be87603090afc976e7cebb357b <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=12929c18db13a01064602637059619f0
Background message, type:error, message: Incompatible domains for Category and Metric - they must be in the same domain
Operation against file 'asmt_metric' was aborted by Business Rule 'Metric domain matches category^b5178c8f87243090afc976e7cebb3554'. Business Rule Stack:Metric domain matches category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=12929c18db13a01064602637059619f0 <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=12929c18db13a01064602637059619f0 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=12929c18db13a01064602637059619f0 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=12929c18db13a01064602637059619f0 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=12929c18db13a01064602637059619f0 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=12929c18db13a01064602637059619f0 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=12929c18db13a01064602637059619f0 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Solution satisfaction</span>, time was: 0:00:00.201
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^7d178c8f87243090afc976e7cebb3555'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1f64488b87243090afc976e7cebb35e1
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^3d178c8f87243090afc976e7cebb3567'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1f64488b87243090afc976e7cebb35e1 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1f64488b87243090afc976e7cebb35e1 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5b64488b87243090afc976e7cebb35e4
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^75178c8f87243090afc976e7cebb3568'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5b64488b87243090afc976e7cebb35e4 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5b64488b87243090afc976e7cebb35e4 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9f64488b87243090afc976e7cebb35cc
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^bd178c8f87243090afc976e7cebb3568'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9f64488b87243090afc976e7cebb35cc <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9f64488b87243090afc976e7cebb35cc <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=db64488b87243090afc976e7cebb35cf
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^f5178c8f87243090afc976e7cebb3569'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=db64488b87243090afc976e7cebb35cf <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=db64488b87243090afc976e7cebb35cf <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=df64488b87243090afc976e7cebb35de
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^31178c8f87243090afc976e7cebb356a'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=df64488b87243090afc976e7cebb35de <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=df64488b87243090afc976e7cebb35de <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Technician's communication</span>, time was: 0:00:00.154
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^f5178c8f87243090afc976e7cebb356b'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1f64488b87243090afc976e7cebb35ae
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^b5178c8f87243090afc976e7cebb357d'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1f64488b87243090afc976e7cebb35ae <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1f64488b87243090afc976e7cebb35ae <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5b64488b87243090afc976e7cebb35b1
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^fd178c8f87243090afc976e7cebb357d'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5b64488b87243090afc976e7cebb35b1 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5b64488b87243090afc976e7cebb35b1 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9364488b87243090afc976e7cebb35a9
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^39178c8f87243090afc976e7cebb357e'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9364488b87243090afc976e7cebb35a9 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9364488b87243090afc976e7cebb35a9 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9764488b87243090afc976e7cebb35b4
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^71178c8f87243090afc976e7cebb357f'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9764488b87243090afc976e7cebb35b4 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9764488b87243090afc976e7cebb35b4 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=df64488b87243090afc976e7cebb35ab
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^b9178c8f87243090afc976e7cebb357f'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=df64488b87243090afc976e7cebb35ab <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=df64488b87243090afc976e7cebb35ab <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=3664488b87243090afc976e7cebb352e
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^71178c8f87243090afc976e7cebb3581'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=3664488b87243090afc976e7cebb352e <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=3664488b87243090afc976e7cebb352e <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=3664488b87243090afc976e7cebb352e <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=3664488b87243090afc976e7cebb352e <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=3664488b87243090afc976e7cebb352e <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=3664488b87243090afc976e7cebb352e <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=3664488b87243090afc976e7cebb352e <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Technician's Professionalism</span>, time was: 0:00:00.149
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^b9178c8f87243090afc976e7cebb3585'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=07d4a3be87603090afc976e7cebb3575
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^4a178c8f87243090afc976e7cebb3597'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=07d4a3be87603090afc976e7cebb3575 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=07d4a3be87603090afc976e7cebb3575 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=47d4a3be87603090afc976e7cebb3576
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^82178c8f87243090afc976e7cebb3598'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=47d4a3be87603090afc976e7cebb3576 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=47d4a3be87603090afc976e7cebb3576 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=83d4a3be87603090afc976e7cebb3573
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^ca178c8f87243090afc976e7cebb3598'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=83d4a3be87603090afc976e7cebb3573 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=83d4a3be87603090afc976e7cebb3573 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=87d4a3be87603090afc976e7cebb3577
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^06178c8f87243090afc976e7cebb3599'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=87d4a3be87603090afc976e7cebb3577 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=87d4a3be87603090afc976e7cebb3577 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=c3d4a3be87603090afc976e7cebb3574
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^4e178c8f87243090afc976e7cebb3599'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=c3d4a3be87603090afc976e7cebb3574 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=c3d4a3be87603090afc976e7cebb3574 <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=47d4a3be87603090afc976e7cebb357a
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Overall quality</span>, time was: 0:00:00.227
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^06178c8f87243090afc976e7cebb359b'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=47d4a3be87603090afc976e7cebb357a <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=47d4a3be87603090afc976e7cebb357a <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=47d4a3be87603090afc976e7cebb357a <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=47d4a3be87603090afc976e7cebb357a <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=47d4a3be87603090afc976e7cebb357a <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=47d4a3be87603090afc976e7cebb357a <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=47d4a3be87603090afc976e7cebb357a <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50
Background message, type:error, message: Incompatible domains for Category and Metric - they must be in the same domain
Operation against file 'asmt_metric' was aborted by Business Rule 'Metric domain matches category^86178c8f87243090afc976e7cebb35d3'. Business Rule Stack:Metric domain matches category
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Technician's Professionalism</span>, time was: 0:00:00.170
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb5c
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^02178c8f87243090afc976e7cebb35fb'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb5c <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb5c <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb5e
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^4a178c8f87243090afc976e7cebb35fb'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb5e <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb5e <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb60
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^82178c8f87243090afc976e7cebb35fc'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb60 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb60 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb62
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^ca178c8f87243090afc976e7cebb35fc'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb62 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb62 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb64
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^06178c8f87243090afc976e7cebb35fd'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb64 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb64 <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c
Background message, type:error, message: Incompatible domains for Category and Metric - they must be in the same domain
Operation against file 'asmt_metric' was aborted by Business Rule 'Metric domain matches category^ca178c8f87243090afc976e7cebb35fe'. Business Rule Stack:Metric domain matches category
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Technician's communication</span>, time was: 0:00:00.150
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb82
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^c617cc8f87243090afc976e7cebb350d'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb82 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb82 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb84
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^0217cc8f87243090afc976e7cebb350e'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb84 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb84 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb86
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^4a17cc8f87243090afc976e7cebb350e'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb86 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb86 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb88
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^8217cc8f87243090afc976e7cebb350f'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb88 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb88 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb8a
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^ca17cc8f87243090afc976e7cebb350f'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb8a <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb8a <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Technician's Professionalism</span>, time was: 0:00:00.134
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^8217cc8f87243090afc976e7cebb3511'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=3e64488b87243090afc976e7cebb354c
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^4217cc8f87243090afc976e7cebb3523'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=3e64488b87243090afc976e7cebb354c <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=3e64488b87243090afc976e7cebb354c <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7a64488b87243090afc976e7cebb354f
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^9a17cc8f87243090afc976e7cebb3523'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7a64488b87243090afc976e7cebb354f <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7a64488b87243090afc976e7cebb354f <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b664488b87243090afc976e7cebb3552
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^d217cc8f87243090afc976e7cebb3524'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b664488b87243090afc976e7cebb3552 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b664488b87243090afc976e7cebb3552 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f264488b87243090afc976e7cebb3555
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^1e17cc8f87243090afc976e7cebb3524'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f264488b87243090afc976e7cebb3555 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f264488b87243090afc976e7cebb3555 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=fe64488b87243090afc976e7cebb3549
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^5617cc8f87243090afc976e7cebb3525'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=fe64488b87243090afc976e7cebb3549 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=fe64488b87243090afc976e7cebb3549 <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Overall quality</span>, time was: 0:00:00.169
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^1e17cc8f87243090afc976e7cebb3526'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0b64488b87243090afc976e7cebb355e
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^da17cc8f87243090afc976e7cebb3538'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0b64488b87243090afc976e7cebb355e <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0b64488b87243090afc976e7cebb355e <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0f64488b87243090afc976e7cebb3569
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^1617cc8f87243090afc976e7cebb3539'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0f64488b87243090afc976e7cebb3569 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0f64488b87243090afc976e7cebb3569 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=4764488b87243090afc976e7cebb3561
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^5e17cc8f87243090afc976e7cebb3539'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=4764488b87243090afc976e7cebb3561 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=4764488b87243090afc976e7cebb3561 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=8364488b87243090afc976e7cebb3564
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^9617cc8f87243090afc976e7cebb353a'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=8364488b87243090afc976e7cebb3564 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=8364488b87243090afc976e7cebb3564 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cf64488b87243090afc976e7cebb3566
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^de17cc8f87243090afc976e7cebb353a'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cf64488b87243090afc976e7cebb3566 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cf64488b87243090afc976e7cebb3566 <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8bd4a3be87603090afc976e7cebb357e
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^9617cc8f87243090afc976e7cebb353c'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8bd4a3be87603090afc976e7cebb357e <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8bd4a3be87603090afc976e7cebb357e <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8bd4a3be87603090afc976e7cebb357e <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8bd4a3be87603090afc976e7cebb357e <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8bd4a3be87603090afc976e7cebb357e <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8bd4a3be87603090afc976e7cebb357e <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8bd4a3be87603090afc976e7cebb357e <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae
Background message, type:error, message: Incompatible domains for Category and Metric - they must be in the same domain
Operation against file 'asmt_metric' was aborted by Business Rule 'Metric domain matches category^de17cc8f87243090afc976e7cebb3540'. Business Rule Stack:Metric domain matches category
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Overall quality</span>, time was: 0:00:00.154
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb5
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^da17cc8f87243090afc976e7cebb354f'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb5 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb5 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb7
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^1617cc8f87243090afc976e7cebb3550'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb7 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb7 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb9
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^5e17cc8f87243090afc976e7cebb3550'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb9 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb9 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbbb
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^9617cc8f87243090afc976e7cebb3551'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbbb <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbbb <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=15c36d0a1bc36c505893964ead4bcbbd
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^de17cc8f87243090afc976e7cebb3551'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=15c36d0a1bc36c505893964ead4bcbbd <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=15c36d0a1bc36c505893964ead4bcbbd <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8fd4a3be87603090afc976e7cebb3578
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Technician's communication</span>, time was: 0:00:00.152
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^9617cc8f87243090afc976e7cebb3553'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8fd4a3be87603090afc976e7cebb3578 <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8fd4a3be87603090afc976e7cebb3578 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8fd4a3be87603090afc976e7cebb3578 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8fd4a3be87603090afc976e7cebb3578 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8fd4a3be87603090afc976e7cebb3578 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8fd4a3be87603090afc976e7cebb3578 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8fd4a3be87603090afc976e7cebb3578 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69
Background message, type:error, message: Incompatible domains for Category and Metric - they must be in the same domain
Operation against file 'asmt_metric' was aborted by Business Rule 'Metric domain matches category^d217cc8f87243090afc976e7cebb3566'. Business Rule Stack:Metric domain matches category
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Satisfaction</span>, time was: 0:00:00.149
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb70
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^ee17cc8f87243090afc976e7cebb3574'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb70 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb70 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb72
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^2a17cc8f87243090afc976e7cebb3575'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb72 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb72 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb74
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^6217cc8f87243090afc976e7cebb3576'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb74 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb74 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb76
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^aa17cc8f87243090afc976e7cebb3576'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb76 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb76 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb78
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^e217cc8f87243090afc976e7cebb3577'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb78 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb78 <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=c3d4a3be87603090afc976e7cebb357d
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Solution satisfaction</span>, time was: 0:00:00.180
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^aa17cc8f87243090afc976e7cebb3578'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=c3d4a3be87603090afc976e7cebb357d <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=c3d4a3be87603090afc976e7cebb357d <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=c3d4a3be87603090afc976e7cebb357d <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=c3d4a3be87603090afc976e7cebb357d <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=c3d4a3be87603090afc976e7cebb357d <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=c3d4a3be87603090afc976e7cebb357d <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=c3d4a3be87603090afc976e7cebb357d <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b
Background message, type:error, message: Incompatible domains for Category and Metric - they must be in the same domain
Operation against file 'asmt_metric' was aborted by Business Rule 'Metric domain matches category^2e17cc8f87243090afc976e7cebb35b0'. Business Rule Stack:Metric domain matches category
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Solution satisfaction</span>, time was: 0:00:00.224
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba2
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^ee17cc8f87243090afc976e7cebb35cb'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba2 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba2 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba4
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^2a17cc8f87243090afc976e7cebb35cc'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba4 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba4 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba6
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^6217cc8f87243090afc976e7cebb35cd'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba6 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba6 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba8
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^aa17cc8f87243090afc976e7cebb35cd'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba8 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba8 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcbaa
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^e217cc8f87243090afc976e7cebb35ce'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcbaa <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcbaa <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=d1c36d0a1bc36c505893964ead4bcbd2
Background message, type:error, message: Incompatible domains for Category and Metric - they must be in the same domain
Operation against file 'asmt_metric' was aborted by Business Rule 'Metric domain matches category^aa17cc8f87243090afc976e7cebb35cf'. Business Rule Stack:Metric domain matches category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=d1c36d0a1bc36c505893964ead4bcbd2 <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=d1c36d0a1bc36c505893964ead4bcbd2 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=d1c36d0a1bc36c505893964ead4bcbd2 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=d1c36d0a1bc36c505893964ead4bcbd2 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=d1c36d0a1bc36c505893964ead4bcbd2 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=d1c36d0a1bc36c505893964ead4bcbd2 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=d1c36d0a1bc36c505893964ead4bcbd2 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Satisfaction</span>, time was: 0:00:00.190
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^2217cc8f87243090afc976e7cebb35d1'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=3264488b87243090afc976e7cebb353f
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^ee17cc8f87243090afc976e7cebb35e2'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=3264488b87243090afc976e7cebb353f <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=3264488b87243090afc976e7cebb353f <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7a64488b87243090afc976e7cebb3535
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^2a17cc8f87243090afc976e7cebb35e3'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7a64488b87243090afc976e7cebb3535 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7a64488b87243090afc976e7cebb3535 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7e64488b87243090afc976e7cebb3541
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^6217cc8f87243090afc976e7cebb35e4'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7e64488b87243090afc976e7cebb3541 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7e64488b87243090afc976e7cebb3541 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b664488b87243090afc976e7cebb3539
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^aa17cc8f87243090afc976e7cebb35e4'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b664488b87243090afc976e7cebb3539 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b664488b87243090afc976e7cebb3539 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f264488b87243090afc976e7cebb353c
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^e217cc8f87243090afc976e7cebb35e5'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f264488b87243090afc976e7cebb353c <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f264488b87243090afc976e7cebb353c <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- asmt_metric@depends_on
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- asmt_category_result@metric_type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- asmt_metric_category@metric_type
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Category domain matches type^fe17cc8f87243090afc976e7cebb35e6'. Business Rule Stack:Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- asmt_assessment_instance_question@category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- asmt_category_result@category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- tm_test_case_instance@asmt_metric_category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- asmt_m2m_category_user@metric_category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- asmt_bubble_chart@metric_y_category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- asmt_m2m_category_assessment@category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- asmt_m2m_xcategory_matrix@metric_category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- asmt_metric@category
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=12929c18db13a01064602637059619f0
Background message, type:error, message: Incompatible domains for Category and Metric - they must be in the same domain
Operation against file 'asmt_metric' was aborted by Business Rule 'Metric domain matches category^3a17cc8f87243090afc976e7cebb35e8'. Business Rule Stack:Metric domain matches category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=12929c18db13a01064602637059619f0 <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=12929c18db13a01064602637059619f0 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=12929c18db13a01064602637059619f0 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=12929c18db13a01064602637059619f0 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=12929c18db13a01064602637059619f0 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=12929c18db13a01064602637059619f0 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=12929c18db13a01064602637059619f0 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50
Background message, type:error, message: Incompatible domains for Category and Metric - they must be in the same domain
Operation against file 'asmt_metric' was aborted by Business Rule 'Metric domain matches category^be17cc8f87243090afc976e7cebb35e9'. Business Rule Stack:Metric domain matches category
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Technician's Professionalism</span>, time was: 0:00:00.198
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb5c
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^ba17cc8f87243090afc976e7cebb35f8'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb5c <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb5c <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb5e
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^f217cc8f87243090afc976e7cebb35f9'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb5e <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb5e <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb60
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^3e17cc8f87243090afc976e7cebb35f9'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb60 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb60 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb62
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^7617cc8f87243090afc976e7cebb35fa'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb62 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb62 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb64
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^be17cc8f87243090afc976e7cebb35fa'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb64 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b4c36d0a1bc36c505893964ead4bcb64 <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=6cc36d0a1bc36c505893964ead4bcb50 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c
Background message, type:error, message: Incompatible domains for Category and Metric - they must be in the same domain
Operation against file 'asmt_metric' was aborted by Business Rule 'Metric domain matches category^7617cc8f87243090afc976e7cebb35fc'. Business Rule Stack:Metric domain matches category
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Technician's communication</span>, time was: 0:00:00.196
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb82
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^721700cf87243090afc976e7cebb350b'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb82 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb82 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb84
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^ba1700cf87243090afc976e7cebb350b'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb84 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb84 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb86
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^f21700cf87243090afc976e7cebb350c'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb86 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb86 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb88
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^3e1700cf87243090afc976e7cebb350c'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb88 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb88 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb8a
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^761700cf87243090afc976e7cebb350d'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb8a <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cdc36d0a1bc36c505893964ead4bcb8a <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=78c36d0a1bc36c505893964ead4bcb7c <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae
Background message, type:error, message: Incompatible domains for Category and Metric - they must be in the same domain
Operation against file 'asmt_metric' was aborted by Business Rule 'Metric domain matches category^3e1700cf87243090afc976e7cebb350e'. Business Rule Stack:Metric domain matches category
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Overall quality</span>, time was: 0:00:00.355
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb5
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^0b1700cf87243090afc976e7cebb351d'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb5 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb5 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb7
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^431700cf87243090afc976e7cebb351e'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb7 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb7 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb9
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^8b1700cf87243090afc976e7cebb351e'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb9 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbb9 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbbb
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^c31700cf87243090afc976e7cebb351f'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbbb <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=05c36d0a1bc36c505893964ead4bcbbb <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=15c36d0a1bc36c505893964ead4bcbbd
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^0f1700cf87243090afc976e7cebb351f'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=15c36d0a1bc36c505893964ead4bcbbd <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=15c36d0a1bc36c505893964ead4bcbbd <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8dc36d0a1bc36c505893964ead4bcbae <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69
Background message, type:error, message: Incompatible domains for Category and Metric - they must be in the same domain
Operation against file 'asmt_metric' was aborted by Business Rule 'Metric domain matches category^c31700cf87243090afc976e7cebb3521'. Business Rule Stack:Metric domain matches category
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Satisfaction</span>, time was: 0:00:00.209
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb70
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^871700cf87243090afc976e7cebb353c'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb70 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb70 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb72
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^cf1700cf87243090afc976e7cebb353c'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb72 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb72 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb74
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^0b1700cf87243090afc976e7cebb353d'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb74 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb74 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb76
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^431700cf87243090afc976e7cebb353e'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb76 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb76 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb78
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^8b1700cf87243090afc976e7cebb353e'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb78 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=30c36d0a1bc36c505893964ead4bcb78 <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b8c36d0a1bc36c505893964ead4bcb69 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b
Background message, type:error, message: Incompatible domains for Category and Metric - they must be in the same domain
Operation against file 'asmt_metric' was aborted by Business Rule 'Metric domain matches category^431700cf87243090afc976e7cebb3540'. Business Rule Stack:Metric domain matches category
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Solution satisfaction</span>, time was: 0:00:00.192
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba2
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^cb1700cf87243090afc976e7cebb3567'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba2 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba2 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba4
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^071700cf87243090afc976e7cebb3568'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba4 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba4 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba6
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^cb1700cf87243090afc976e7cebb3581'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba6 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba6 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba8
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^071700cf87243090afc976e7cebb3582'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba8 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcba8 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcbaa
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^4f1700cf87243090afc976e7cebb3582'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcbaa <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=45c36d0a1bc36c505893964ead4bcbaa <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=cdc36d0a1bc36c505893964ead4bcb9b <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=d1c36d0a1bc36c505893964ead4bcbd2
Background message, type:error, message: Incompatible domains for Category and Metric - they must be in the same domain
Operation against file 'asmt_metric' was aborted by Business Rule 'Metric domain matches category^071700cf87243090afc976e7cebb3584'. Business Rule Stack:Metric domain matches category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=d1c36d0a1bc36c505893964ead4bcbd2 <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=d1c36d0a1bc36c505893964ead4bcbd2 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=d1c36d0a1bc36c505893964ead4bcbd2 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=d1c36d0a1bc36c505893964ead4bcbd2 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=d1c36d0a1bc36c505893964ead4bcbd2 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=d1c36d0a1bc36c505893964ead4bcbd2 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=d1c36d0a1bc36c505893964ead4bcbd2 <- asmt_metric@depends_on
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- asmt_m2m_ycategory_matrix@metric_category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- asmt_bubble_chart@metric_z_category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=2cc36d0a1bc36c505893964ead4bcb47 <- asmt_bubble_chart@metric_x_category
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Category domain matches type^c31700cf87243090afc976e7cebb3586'. Business Rule Stack:Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- asmt_assessment_instance_question@category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- asmt_category_result@category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- tm_test_case_instance@asmt_metric_category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- asmt_m2m_category_user@metric_category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- asmt_bubble_chart@metric_y_category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- asmt_m2m_category_assessment@category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- asmt_m2m_xcategory_matrix@metric_category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- asmt_metric@category
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=06178c8f87243090afc976e7cebb359b
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Overall quality</span>, time was: 0:00:00.183
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^0f1700cf87243090afc976e7cebb3587'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=06178c8f87243090afc976e7cebb359b <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=06178c8f87243090afc976e7cebb359b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0a178c8f87243090afc976e7cebb35b0
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^db1700cf87243090afc976e7cebb3599'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0a178c8f87243090afc976e7cebb35b0 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0a178c8f87243090afc976e7cebb35b0 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=06178c8f87243090afc976e7cebb359b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=46178c8f87243090afc976e7cebb35b3
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^171700cf87243090afc976e7cebb359a'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=46178c8f87243090afc976e7cebb35b3 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=46178c8f87243090afc976e7cebb35b3 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=06178c8f87243090afc976e7cebb359b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=8a178c8f87243090afc976e7cebb359b
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^5f1700cf87243090afc976e7cebb359a'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=8a178c8f87243090afc976e7cebb359b <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=8a178c8f87243090afc976e7cebb359b <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=06178c8f87243090afc976e7cebb359b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=8e178c8f87243090afc976e7cebb35aa
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^971700cf87243090afc976e7cebb359b'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=8e178c8f87243090afc976e7cebb35aa <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=8e178c8f87243090afc976e7cebb35aa <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=06178c8f87243090afc976e7cebb359b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=ca178c8f87243090afc976e7cebb35ad
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^df1700cf87243090afc976e7cebb359b'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=ca178c8f87243090afc976e7cebb35ad <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=ca178c8f87243090afc976e7cebb35ad <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=06178c8f87243090afc976e7cebb359b <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=06178c8f87243090afc976e7cebb359b <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=06178c8f87243090afc976e7cebb359b <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=06178c8f87243090afc976e7cebb359b <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=06178c8f87243090afc976e7cebb359b <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=06178c8f87243090afc976e7cebb359b <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0764488b87243090afc976e7cebb3593
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^971700cf87243090afc976e7cebb359d'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0764488b87243090afc976e7cebb3593 <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0764488b87243090afc976e7cebb3593 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0764488b87243090afc976e7cebb3593 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0764488b87243090afc976e7cebb3593 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0764488b87243090afc976e7cebb3593 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0764488b87243090afc976e7cebb3593 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0764488b87243090afc976e7cebb3593 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0bd4277e87603090afc976e7cebb3572
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^df1700cf87243090afc976e7cebb35a1'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0bd4277e87603090afc976e7cebb3572 <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0bd4277e87603090afc976e7cebb3572 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0bd4277e87603090afc976e7cebb3572 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0bd4277e87603090afc976e7cebb3572 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0bd4277e87603090afc976e7cebb3572 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0bd4277e87603090afc976e7cebb3572 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0bd4277e87603090afc976e7cebb3572 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0fd4a3be87603090afc976e7cebb357b
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Satisfaction</span>, time was: 0:00:00.169
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^1b1700cf87243090afc976e7cebb35a6'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0fd4a3be87603090afc976e7cebb357b <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0fd4a3be87603090afc976e7cebb357b <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0fd4a3be87603090afc976e7cebb357b <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0fd4a3be87603090afc976e7cebb357b <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0fd4a3be87603090afc976e7cebb357b <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0fd4a3be87603090afc976e7cebb357b <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=0fd4a3be87603090afc976e7cebb357b <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Solution satisfaction</span>, time was: 0:00:00.220
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^1f1700cf87243090afc976e7cebb35c5'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1f64488b87243090afc976e7cebb35e1
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^5b1700cf87243090afc976e7cebb35f0'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1f64488b87243090afc976e7cebb35e1 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1f64488b87243090afc976e7cebb35e1 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5b64488b87243090afc976e7cebb35e4
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^931700cf87243090afc976e7cebb35f1'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5b64488b87243090afc976e7cebb35e4 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5b64488b87243090afc976e7cebb35e4 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9f64488b87243090afc976e7cebb35cc
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^5b1740cf87243090afc976e7cebb350a'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9f64488b87243090afc976e7cebb35cc <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9f64488b87243090afc976e7cebb35cc <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=db64488b87243090afc976e7cebb35cf
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^931740cf87243090afc976e7cebb350b'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=db64488b87243090afc976e7cebb35cf <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=db64488b87243090afc976e7cebb35cf <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=df64488b87243090afc976e7cebb35de
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^db1740cf87243090afc976e7cebb350b'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=df64488b87243090afc976e7cebb35de <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=df64488b87243090afc976e7cebb35de <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1b64488b87243090afc976e7cebb35cc <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1e17cc8f87243090afc976e7cebb3526
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Overall quality</span>, time was: 0:00:00.248
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^931740cf87243090afc976e7cebb350d'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1e17cc8f87243090afc976e7cebb3526 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1e17cc8f87243090afc976e7cebb3526 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1e17cc8f87243090afc976e7cebb352c
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^631740cf87243090afc976e7cebb351f'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1e17cc8f87243090afc976e7cebb352c <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1e17cc8f87243090afc976e7cebb352c <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1e17cc8f87243090afc976e7cebb3526 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5a17cc8f87243090afc976e7cebb352f
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^ab1740cf87243090afc976e7cebb351f'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5a17cc8f87243090afc976e7cebb352f <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5a17cc8f87243090afc976e7cebb352f <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1e17cc8f87243090afc976e7cebb3526 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9217cc8f87243090afc976e7cebb3527
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^e31740cf87243090afc976e7cebb3520'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9217cc8f87243090afc976e7cebb3527 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9217cc8f87243090afc976e7cebb3527 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1e17cc8f87243090afc976e7cebb3526 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9617cc8f87243090afc976e7cebb3532
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^2f1740cf87243090afc976e7cebb3520'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9617cc8f87243090afc976e7cebb3532 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9617cc8f87243090afc976e7cebb3532 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1e17cc8f87243090afc976e7cebb3526 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=de17cc8f87243090afc976e7cebb3529
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^671740cf87243090afc976e7cebb3521'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=de17cc8f87243090afc976e7cebb3529 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=de17cc8f87243090afc976e7cebb3529 <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1e17cc8f87243090afc976e7cebb3526 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1e17cc8f87243090afc976e7cebb3526 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1e17cc8f87243090afc976e7cebb3526 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1e17cc8f87243090afc976e7cebb3526 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1e17cc8f87243090afc976e7cebb3526 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1e17cc8f87243090afc976e7cebb3526 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Technician's communication</span>, time was: 0:00:00.161
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^2f1740cf87243090afc976e7cebb3522'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1f64488b87243090afc976e7cebb35ae
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^eb1740cf87243090afc976e7cebb3534'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1f64488b87243090afc976e7cebb35ae <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1f64488b87243090afc976e7cebb35ae <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5b64488b87243090afc976e7cebb35b1
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^271740cf87243090afc976e7cebb3535'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5b64488b87243090afc976e7cebb35b1 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5b64488b87243090afc976e7cebb35b1 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9364488b87243090afc976e7cebb35a9
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^6f1740cf87243090afc976e7cebb3535'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9364488b87243090afc976e7cebb35a9 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9364488b87243090afc976e7cebb35a9 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9764488b87243090afc976e7cebb35b4
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^a71740cf87243090afc976e7cebb3536'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9764488b87243090afc976e7cebb35b4 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9764488b87243090afc976e7cebb35b4 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=df64488b87243090afc976e7cebb35ab
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^ef1740cf87243090afc976e7cebb3536'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=df64488b87243090afc976e7cebb35ab <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=df64488b87243090afc976e7cebb35ab <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=1f64488b87243090afc976e7cebb35a8 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=21178c8f87243090afc976e7cebb3530
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^a71740cf87243090afc976e7cebb3538'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=21178c8f87243090afc976e7cebb3530 <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=21178c8f87243090afc976e7cebb3530 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=21178c8f87243090afc976e7cebb3530 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=21178c8f87243090afc976e7cebb3530 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=21178c8f87243090afc976e7cebb3530 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=21178c8f87243090afc976e7cebb3530 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=21178c8f87243090afc976e7cebb3530 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=2217cc8f87243090afc976e7cebb35d1
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Satisfaction</span>, time was: 0:00:00.146
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^a71740cf87243090afc976e7cebb3549'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=2217cc8f87243090afc976e7cebb35d1 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=2217cc8f87243090afc976e7cebb35d1 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=2217cc8f87243090afc976e7cebb35d7
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^671740cf87243090afc976e7cebb355b'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=2217cc8f87243090afc976e7cebb35d7 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=2217cc8f87243090afc976e7cebb35d7 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=2217cc8f87243090afc976e7cebb35d1 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=6e17cc8f87243090afc976e7cebb35d9
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^af1740cf87243090afc976e7cebb355b'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=6e17cc8f87243090afc976e7cebb35d9 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=6e17cc8f87243090afc976e7cebb35d9 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=2217cc8f87243090afc976e7cebb35d1 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=a617cc8f87243090afc976e7cebb35d1
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^e71740cf87243090afc976e7cebb355c'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=a617cc8f87243090afc976e7cebb35d1 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=a617cc8f87243090afc976e7cebb35d1 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=2217cc8f87243090afc976e7cebb35d1 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=aa17cc8f87243090afc976e7cebb35dc
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^231740cf87243090afc976e7cebb355d'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=aa17cc8f87243090afc976e7cebb35dc <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=aa17cc8f87243090afc976e7cebb35dc <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=2217cc8f87243090afc976e7cebb35d1 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=e217cc8f87243090afc976e7cebb35d4
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^6b1740cf87243090afc976e7cebb355d'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=e217cc8f87243090afc976e7cebb35d4 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=e217cc8f87243090afc976e7cebb35d4 <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=2217cc8f87243090afc976e7cebb35d1 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=2217cc8f87243090afc976e7cebb35d1 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=2217cc8f87243090afc976e7cebb35d1 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=2217cc8f87243090afc976e7cebb35d1 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=2217cc8f87243090afc976e7cebb35d1 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=2217cc8f87243090afc976e7cebb35d1 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=3664488b87243090afc976e7cebb352e
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^231740cf87243090afc976e7cebb355f'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=3664488b87243090afc976e7cebb352e <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=3664488b87243090afc976e7cebb352e <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=3664488b87243090afc976e7cebb352e <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=3664488b87243090afc976e7cebb352e <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=3664488b87243090afc976e7cebb352e <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=3664488b87243090afc976e7cebb352e <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=3664488b87243090afc976e7cebb352e <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Technician's Professionalism</span>, time was: 0:00:00.208
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^6b1740cf87243090afc976e7cebb3563'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=07d4a3be87603090afc976e7cebb3575
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^3b1740cf87243090afc976e7cebb3575'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=07d4a3be87603090afc976e7cebb3575 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=07d4a3be87603090afc976e7cebb3575 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=47d4a3be87603090afc976e7cebb3576
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^731740cf87243090afc976e7cebb3576'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=47d4a3be87603090afc976e7cebb3576 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=47d4a3be87603090afc976e7cebb3576 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=83d4a3be87603090afc976e7cebb3573
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^bb1740cf87243090afc976e7cebb3576'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=83d4a3be87603090afc976e7cebb3573 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=83d4a3be87603090afc976e7cebb3573 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=87d4a3be87603090afc976e7cebb3577
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^f31740cf87243090afc976e7cebb3577'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=87d4a3be87603090afc976e7cebb3577 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=87d4a3be87603090afc976e7cebb3577 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=c3d4a3be87603090afc976e7cebb3574
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^3f1740cf87243090afc976e7cebb3577'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=c3d4a3be87603090afc976e7cebb3574 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=c3d4a3be87603090afc976e7cebb3574 <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=43d4277e87603090afc976e7cebb3574 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=47d4a3be87603090afc976e7cebb357a
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Overall quality</span>, time was: 0:00:00.191
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^f31740cf87243090afc976e7cebb3579'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=47d4a3be87603090afc976e7cebb357a <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=47d4a3be87603090afc976e7cebb357a <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=47d4a3be87603090afc976e7cebb357a <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=47d4a3be87603090afc976e7cebb357a <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=47d4a3be87603090afc976e7cebb357a <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=47d4a3be87603090afc976e7cebb357a <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=47d4a3be87603090afc976e7cebb357a <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb352a
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^331740cf87243090afc976e7cebb358c'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb352a <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb352a <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb352a <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb352a <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb352a <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb352a <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb352a <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb3534
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Satisfaction</span>, time was: 0:00:00.135
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^7b1740cf87243090afc976e7cebb3590'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb3534 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb3534 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=65178c8f87243090afc976e7cebb3538
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^3b1740cf87243090afc976e7cebb35a2'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=65178c8f87243090afc976e7cebb3538 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=65178c8f87243090afc976e7cebb3538 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb3534 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=69178c8f87243090afc976e7cebb3547
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^731740cf87243090afc976e7cebb35a3'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=69178c8f87243090afc976e7cebb3547 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=69178c8f87243090afc976e7cebb3547 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb3534 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=a5178c8f87243090afc976e7cebb354a
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^bb1740cf87243090afc976e7cebb35a3'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=a5178c8f87243090afc976e7cebb354a <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=a5178c8f87243090afc976e7cebb354a <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb3534 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=ed178c8f87243090afc976e7cebb3534
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^f31740cf87243090afc976e7cebb35a4'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=ed178c8f87243090afc976e7cebb3534 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=ed178c8f87243090afc976e7cebb3534 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb3534 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f1178c8f87243090afc976e7cebb354d
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^3f1740cf87243090afc976e7cebb35a4'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f1178c8f87243090afc976e7cebb354d <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f1178c8f87243090afc976e7cebb354d <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb3534 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb3534 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb3534 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb3534 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb3534 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=69178c8f87243090afc976e7cebb3534 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=71178c8f87243090afc976e7cebb3581
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^f31740cf87243090afc976e7cebb35a6'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=71178c8f87243090afc976e7cebb3581 <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=71178c8f87243090afc976e7cebb3581 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=71178c8f87243090afc976e7cebb3581 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=71178c8f87243090afc976e7cebb3581 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=71178c8f87243090afc976e7cebb3581 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=71178c8f87243090afc976e7cebb3581 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=71178c8f87243090afc976e7cebb3581 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Technician's Professionalism</span>, time was: 0:00:00.204
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^3f1740cf87243090afc976e7cebb35aa'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=3e64488b87243090afc976e7cebb354c
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^c42740cf87243090afc976e7cebb35ee'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=3e64488b87243090afc976e7cebb354c <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=3e64488b87243090afc976e7cebb354c <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7a64488b87243090afc976e7cebb354f
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^002740cf87243090afc976e7cebb35ef'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7a64488b87243090afc976e7cebb354f <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7a64488b87243090afc976e7cebb354f <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b664488b87243090afc976e7cebb3552
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^482740cf87243090afc976e7cebb35ef'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b664488b87243090afc976e7cebb3552 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b664488b87243090afc976e7cebb3552 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f264488b87243090afc976e7cebb3555
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^802740cf87243090afc976e7cebb35f0'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f264488b87243090afc976e7cebb3555 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f264488b87243090afc976e7cebb3555 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=fe64488b87243090afc976e7cebb3549
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^c82740cf87243090afc976e7cebb35f0'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=fe64488b87243090afc976e7cebb3549 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=fe64488b87243090afc976e7cebb3549 <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7a64488b87243090afc976e7cebb3549 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7d178c8f87243090afc976e7cebb3555
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Solution satisfaction</span>, time was: 0:00:00.152
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^802740cf87243090afc976e7cebb35f2'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7d178c8f87243090afc976e7cebb3555 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7d178c8f87243090afc976e7cebb3555 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=31178c8f87243090afc976e7cebb3559
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^402780cf87243090afc976e7cebb3504'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=31178c8f87243090afc976e7cebb3559 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=31178c8f87243090afc976e7cebb3559 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7d178c8f87243090afc976e7cebb3555 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7d178c8f87243090afc976e7cebb355b
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^882780cf87243090afc976e7cebb3504'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7d178c8f87243090afc976e7cebb355b <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7d178c8f87243090afc976e7cebb355b <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7d178c8f87243090afc976e7cebb3555 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b9178c8f87243090afc976e7cebb355e
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^c02780cf87243090afc976e7cebb3505'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b9178c8f87243090afc976e7cebb355e <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b9178c8f87243090afc976e7cebb355e <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7d178c8f87243090afc976e7cebb3555 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f1178c8f87243090afc976e7cebb3556
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^0c2780cf87243090afc976e7cebb3505'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f1178c8f87243090afc976e7cebb3556 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f1178c8f87243090afc976e7cebb3556 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7d178c8f87243090afc976e7cebb3555 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f5178c8f87243090afc976e7cebb3561
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^442780cf87243090afc976e7cebb3506'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f5178c8f87243090afc976e7cebb3561 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f5178c8f87243090afc976e7cebb3561 <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7d178c8f87243090afc976e7cebb3555 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7d178c8f87243090afc976e7cebb3555 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7d178c8f87243090afc976e7cebb3555 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7d178c8f87243090afc976e7cebb3555 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7d178c8f87243090afc976e7cebb3555 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=7d178c8f87243090afc976e7cebb3555 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8217cc8f87243090afc976e7cebb3511
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Technician's Professionalism</span>, time was: 0:00:00.134
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^0c2780cf87243090afc976e7cebb3507'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8217cc8f87243090afc976e7cebb3511 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8217cc8f87243090afc976e7cebb3511 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0a17cc8f87243090afc976e7cebb3511
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^802780cf87243090afc976e7cebb3526'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0a17cc8f87243090afc976e7cebb3511 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0a17cc8f87243090afc976e7cebb3511 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8217cc8f87243090afc976e7cebb3511 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0e17cc8f87243090afc976e7cebb351c
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^c82780cf87243090afc976e7cebb3526'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0e17cc8f87243090afc976e7cebb351c <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0e17cc8f87243090afc976e7cebb351c <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8217cc8f87243090afc976e7cebb3511 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=4617cc8f87243090afc976e7cebb3514
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^042780cf87243090afc976e7cebb3527'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=4617cc8f87243090afc976e7cebb3514 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=4617cc8f87243090afc976e7cebb3514 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8217cc8f87243090afc976e7cebb3511 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=8217cc8f87243090afc976e7cebb3517
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^4c2780cf87243090afc976e7cebb3527'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=8217cc8f87243090afc976e7cebb3517 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=8217cc8f87243090afc976e7cebb3517 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8217cc8f87243090afc976e7cebb3511 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=ce17cc8f87243090afc976e7cebb3519
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^842780cf87243090afc976e7cebb3528'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=ce17cc8f87243090afc976e7cebb3519 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=ce17cc8f87243090afc976e7cebb3519 <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8217cc8f87243090afc976e7cebb3511 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8217cc8f87243090afc976e7cebb3511 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8217cc8f87243090afc976e7cebb3511 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8217cc8f87243090afc976e7cebb3511 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8217cc8f87243090afc976e7cebb3511 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8217cc8f87243090afc976e7cebb3511 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Overall quality</span>, time was: 0:00:00.161
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^4c2780cf87243090afc976e7cebb3529'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0b64488b87243090afc976e7cebb355e
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^1c2780cf87243090afc976e7cebb353b'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0b64488b87243090afc976e7cebb355e <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0b64488b87243090afc976e7cebb355e <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0f64488b87243090afc976e7cebb3569
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^542780cf87243090afc976e7cebb353c'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0f64488b87243090afc976e7cebb3569 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=0f64488b87243090afc976e7cebb3569 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=4764488b87243090afc976e7cebb3561
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^9c2780cf87243090afc976e7cebb353c'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=4764488b87243090afc976e7cebb3561 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=4764488b87243090afc976e7cebb3561 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=8364488b87243090afc976e7cebb3564
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^d42780cf87243090afc976e7cebb353d'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=8364488b87243090afc976e7cebb3564 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=8364488b87243090afc976e7cebb3564 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cf64488b87243090afc976e7cebb3566
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^102780cf87243090afc976e7cebb353e'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cf64488b87243090afc976e7cebb3566 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=cf64488b87243090afc976e7cebb3566 <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8364488b87243090afc976e7cebb355e <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8bd4a3be87603090afc976e7cebb357e
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^d42780cf87243090afc976e7cebb353f'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8bd4a3be87603090afc976e7cebb357e <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8bd4a3be87603090afc976e7cebb357e <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8bd4a3be87603090afc976e7cebb357e <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8bd4a3be87603090afc976e7cebb357e <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8bd4a3be87603090afc976e7cebb357e <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8bd4a3be87603090afc976e7cebb357e <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8bd4a3be87603090afc976e7cebb357e <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8fd4a3be87603090afc976e7cebb3578
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Technician's communication</span>, time was: 0:00:00.140
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^102780cf87243090afc976e7cebb3544'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8fd4a3be87603090afc976e7cebb3578 <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8fd4a3be87603090afc976e7cebb3578 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8fd4a3be87603090afc976e7cebb3578 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8fd4a3be87603090afc976e7cebb3578 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8fd4a3be87603090afc976e7cebb3578 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8fd4a3be87603090afc976e7cebb3578 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=8fd4a3be87603090afc976e7cebb3578 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb353c
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^5c2780cf87243090afc976e7cebb3556'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb353c <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb353c <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb353c <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb353c <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb353c <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb353c <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb353c <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb3553
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Technician's communication</span>, time was: 0:00:00.143
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^942780cf87243090afc976e7cebb355b'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb3553 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb3553 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1217cc8f87243090afc976e7cebb355f
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^542780cf87243090afc976e7cebb356d'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1217cc8f87243090afc976e7cebb355f <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1217cc8f87243090afc976e7cebb355f <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb3553 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1e17cc8f87243090afc976e7cebb3553
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^9c2780cf87243090afc976e7cebb356d'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1e17cc8f87243090afc976e7cebb3553 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=1e17cc8f87243090afc976e7cebb3553 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb3553 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5a17cc8f87243090afc976e7cebb3556
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^d42780cf87243090afc976e7cebb356e'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5a17cc8f87243090afc976e7cebb3556 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=5a17cc8f87243090afc976e7cebb3556 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb3553 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9617cc8f87243090afc976e7cebb3559
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^102780cf87243090afc976e7cebb356f'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9617cc8f87243090afc976e7cebb3559 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=9617cc8f87243090afc976e7cebb3559 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb3553 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=d217cc8f87243090afc976e7cebb355c
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^582780cf87243090afc976e7cebb356f'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=d217cc8f87243090afc976e7cebb355c <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=d217cc8f87243090afc976e7cebb355c <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb3553 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb3553 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb3553 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb3553 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb3553 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=9617cc8f87243090afc976e7cebb3553 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=aa17cc8f87243090afc976e7cebb3578
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Solution satisfaction</span>, time was: 0:00:00.141
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^102780cf87243090afc976e7cebb3571'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=aa17cc8f87243090afc976e7cebb3578 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=aa17cc8f87243090afc976e7cebb3578 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=2217cc8f87243090afc976e7cebb3579
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^dc2780cf87243090afc976e7cebb3582'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=2217cc8f87243090afc976e7cebb3579 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=2217cc8f87243090afc976e7cebb3579 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=aa17cc8f87243090afc976e7cebb3578 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=2617cc8f87243090afc976e7cebb3584
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^182780cf87243090afc976e7cebb3583'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=2617cc8f87243090afc976e7cebb3584 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=2617cc8f87243090afc976e7cebb3584 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=aa17cc8f87243090afc976e7cebb3578 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=6e17cc8f87243090afc976e7cebb357b
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^502780cf87243090afc976e7cebb3584'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=6e17cc8f87243090afc976e7cebb357b <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=6e17cc8f87243090afc976e7cebb357b <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=aa17cc8f87243090afc976e7cebb3578 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=aa17cc8f87243090afc976e7cebb357e
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^982780cf87243090afc976e7cebb3584'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=aa17cc8f87243090afc976e7cebb357e <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=aa17cc8f87243090afc976e7cebb357e <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=aa17cc8f87243090afc976e7cebb3578 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=e617cc8f87243090afc976e7cebb3581
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^d02780cf87243090afc976e7cebb3585'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=e617cc8f87243090afc976e7cebb3581 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=e617cc8f87243090afc976e7cebb3581 <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=aa17cc8f87243090afc976e7cebb3578 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=aa17cc8f87243090afc976e7cebb3578 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=aa17cc8f87243090afc976e7cebb3578 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=aa17cc8f87243090afc976e7cebb3578 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=aa17cc8f87243090afc976e7cebb3578 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=aa17cc8f87243090afc976e7cebb3578 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b9178c8f87243090afc976e7cebb3585
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Technician's Professionalism</span>, time was: 0:00:00.161
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^a82780cf87243090afc976e7cebb3586'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b9178c8f87243090afc976e7cebb3585 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b9178c8f87243090afc976e7cebb3585 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=31178c8f87243090afc976e7cebb3586
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^202780cf87243090afc976e7cebb35a5'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=31178c8f87243090afc976e7cebb3586 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=31178c8f87243090afc976e7cebb3586 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b9178c8f87243090afc976e7cebb3585 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=35178c8f87243090afc976e7cebb3591
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^682780cf87243090afc976e7cebb35a5'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=35178c8f87243090afc976e7cebb3591 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=35178c8f87243090afc976e7cebb3591 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b9178c8f87243090afc976e7cebb3585 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7d178c8f87243090afc976e7cebb3588
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^a02780cf87243090afc976e7cebb35a6'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7d178c8f87243090afc976e7cebb3588 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7d178c8f87243090afc976e7cebb3588 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b9178c8f87243090afc976e7cebb3585 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b9178c8f87243090afc976e7cebb358b
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^e82780cf87243090afc976e7cebb35a6'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b9178c8f87243090afc976e7cebb358b <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b9178c8f87243090afc976e7cebb358b <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b9178c8f87243090afc976e7cebb3585 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f5178c8f87243090afc976e7cebb358e
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^242780cf87243090afc976e7cebb35a7'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f5178c8f87243090afc976e7cebb358e <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f5178c8f87243090afc976e7cebb358e <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b9178c8f87243090afc976e7cebb3585 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b9178c8f87243090afc976e7cebb3585 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b9178c8f87243090afc976e7cebb3585 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b9178c8f87243090afc976e7cebb3585 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b9178c8f87243090afc976e7cebb3585 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=b9178c8f87243090afc976e7cebb3585 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=c3d4a3be87603090afc976e7cebb357d
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Solution satisfaction</span>, time was: 0:00:00.145
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^e82780cf87243090afc976e7cebb35a8'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=c3d4a3be87603090afc976e7cebb357d <- asmt_metric_definition@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=c3d4a3be87603090afc976e7cebb357d <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=c3d4a3be87603090afc976e7cebb357d <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=c3d4a3be87603090afc976e7cebb357d <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=c3d4a3be87603090afc976e7cebb357d <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=c3d4a3be87603090afc976e7cebb357d <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=c3d4a3be87603090afc976e7cebb357d <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Satisfaction</span>, time was: 0:00:00.140
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^282780cf87243090afc976e7cebb35bb'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=3264488b87243090afc976e7cebb353f
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^e42780cf87243090afc976e7cebb35cd'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=3264488b87243090afc976e7cebb353f <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=3264488b87243090afc976e7cebb353f <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7a64488b87243090afc976e7cebb3535
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^202780cf87243090afc976e7cebb35ce'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7a64488b87243090afc976e7cebb3535 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7a64488b87243090afc976e7cebb3535 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7e64488b87243090afc976e7cebb3541
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^682780cf87243090afc976e7cebb35ce'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7e64488b87243090afc976e7cebb3541 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7e64488b87243090afc976e7cebb3541 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b664488b87243090afc976e7cebb3539
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^a02780cf87243090afc976e7cebb35cf'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b664488b87243090afc976e7cebb3539 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b664488b87243090afc976e7cebb3539 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f264488b87243090afc976e7cebb353c
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^e82780cf87243090afc976e7cebb35cf'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f264488b87243090afc976e7cebb353c <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f264488b87243090afc976e7cebb353c <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f264488b87243090afc976e7cebb3535 <- asmt_metric@depends_on
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f5178c8f87243090afc976e7cebb356b
Slow business rule 'Create Numeric Scale Answers' on asmt_metric:<span class = "session-log-bold-text"> Technician's communication</span>, time was: 0:00:00.133
Background message, type:error, message: Incompatible domains for Category and Type - they must be in the same domain
Operation against file 'asmt_metric_category' was aborted by Business Rule 'Update Category Count^a02780cf87243090afc976e7cebb35d1'. Business Rule Stack:Update Category Count,Category domain matches type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f5178c8f87243090afc976e7cebb356b <- asmt_metric_definition@metric
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f5178c8f87243090afc976e7cebb356b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=35178c8f87243090afc976e7cebb3574
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^282780cf87243090afc976e7cebb35ef'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=35178c8f87243090afc976e7cebb3574 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=35178c8f87243090afc976e7cebb3574 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f5178c8f87243090afc976e7cebb356b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=71178c8f87243090afc976e7cebb3577
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^602780cf87243090afc976e7cebb35f0'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=71178c8f87243090afc976e7cebb3577 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=71178c8f87243090afc976e7cebb3577 <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f5178c8f87243090afc976e7cebb356b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7d178c8f87243090afc976e7cebb356b
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^a82780cf87243090afc976e7cebb35f0'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7d178c8f87243090afc976e7cebb356b <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=7d178c8f87243090afc976e7cebb356b <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f5178c8f87243090afc976e7cebb356b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b9178c8f87243090afc976e7cebb356e
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^f02780cf87243090afc976e7cebb35f1'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b9178c8f87243090afc976e7cebb356e <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=b9178c8f87243090afc976e7cebb356e <- asmt_metric_result@metric_definition
*** Script:  > Found Reference: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f5178c8f87243090afc976e7cebb356b <- https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f5178c8f87243090afc976e7cebb3571
Background message, type:error, message: The value must not match an existing value
Operation against file 'asmt_metric_definition' was aborted by Business Rule 'Verify value^3c2780cf87243090afc976e7cebb35f1'. Business Rule Stack:Verify value
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f5178c8f87243090afc976e7cebb3571 <- asmt_assessment_instance_question@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_definition.do?sys_id=f5178c8f87243090afc976e7cebb3571 <- asmt_metric_result@metric_definition
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f5178c8f87243090afc976e7cebb356b <- asmt_metric_result@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f5178c8f87243090afc976e7cebb356b <- asmt_metric_type@sample_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f5178c8f87243090afc976e7cebb356b <- tm_test_instance@asmt_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f5178c8f87243090afc976e7cebb356b <- asmt_nps_result@nps_metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f5178c8f87243090afc976e7cebb356b <- asmt_assessment_instance_question@metric
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric.do?sys_id=f5178c8f87243090afc976e7cebb356b <- asmt_metric@depends_on
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- asmt_m2m_ycategory_matrix@metric_category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- asmt_bubble_chart@metric_z_category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_category.do?sys_id=8bd4277e87603090afc976e7cebb3570 <- asmt_bubble_chart@metric_x_category
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- asmt_nps_result@metric_type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- asmt_assessment@metric_type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- asmt_assessment_instance@metric_type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- asmt_bubble_chart@metric_type
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- asmt_condition@assessment
*** Script:  > Found Referencing Table: https://sedgwicktechtest.service-now.com/asmt_metric_type.do?sys_id=d4c365c61bc36c505893964ead4bcb6d <- tm_test_plan@asmt_metric_type
