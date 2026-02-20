<link
rel="stylesheet"
type="text/css"
href="https://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/css/jquery.dataTables.css"
/>

<div class="page-header page-header-default">
	<div class="page-header-content">
		<div class="page-title">
			<h4><i class="icon-arrow-left52 position-left"></i> <span class="text-semibold">Match</span> - Manage Fancy Bet</h4>
		</div>
	</div>
	<div class="breadcrumb-line">
		<ul class="breadcrumb">
			<li><a href="<?php echo SITE_URL; ?>fantasy/league"><i class="icon-home2 position-left"></i>Fancy Match</a></li>
			<li class="active">Manage Fancy Bet</li>
		</ul>
	</div>
</div>
<div class="content">
    <?= $this->Flash->render();  ?>
    <div class="panel panel-default">
        <div class="panel-heading">
            <h5 class="panel-title">Manage Fancy Bet</h5>
        </div>
        <div class="panel-body" style="background:#f5f5f5;">
          
		<div id="DataTables_Table_3_wrapper" style="padding:10px">
						<table class="table datatable-html table_id">
            <thead>
                <tr>
                    <th><input type="checkbox" id="selectAll"></th>
                    <th >Fancy</th>
                      <th >User Name</th>
                  <th >Stack</th>
                               <th >Odds</th>
   					  <th style="">Result</th> 
				<th style="">Profit</th>
							<th style="">Loss</th>
									<th style="">P/L</th>
   <th style="">Created</th>
                							   <th style="">IP</th>
    
               </tr>
            </thead>
            <tbody>
                <?php 
                if(count($resFancyList)>0){
                   
                foreach($resFancyList as $value){
				$rowFancyCount = $resBetCount->find('all')->where(['bet_selection_id'=>$value->fs_fancy_selection_id,'bet_match_api_id'=>$value->fancy_match_api_id])->count();
				?>
                <tr>
                    <td style="text-align:left">
                        <input type="checkbox" name="match_id[]" class="checkbox clsSelectSingle" value="<?= $this->Number->format($value->match_id) ?>">
                    </td>
                    <td ><?php echo $value['fs_fancy_name'];?></td>
                    <td><?php echo $value['fs_fancy_status'];?></td>
                    <td><?php echo $value['fancy_result'];?></td>
					<td><a href="<?php echo SITE_URL; ?>fantasy/match/activefancybet/<?php echo $value->fs_fancy_selection_id; ?>/<?php echo $value->fancy_match_api_id; ?>"><?php echo $rowFancyCount;?></a></td>
					<td><?php echo $value['fs_fancy_created'];?></td>
						<td><a href="#" data-toggle="modal" data-target="#flipFlop">Declare Result</a></td>

                   
                    
                    
                </tr>
                <?php }}else{ ?>
                <tr><td colspan="8" style="text-align:center">No Result Found</td></tr>
                <?php }?>
            </tbody>
        </table>
		</div>
     
    </div>
</div>

<div class="modal fade" id="flipFlop" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
<div class="modal-dialog modal-sm" role="document">
<div class="modal-content">
<div class="modal-header">
<button type="button" class="close" data-dismiss="modal" aria-label="Close">
<span aria-hidden="true">&times;</span>
</button>
<h4 class="modal-title" id="modalLabel">Declare Result:-<?php echo $value['fs_fancy_name'];?></h4>
</div>
<div class="modal-body">
<div class="row">
<?php echo  $this->Form->create('', ['type' => 'POST','id'=>'popup-form','url'=>'/fantasy/match/addfancypopup','enctype'=>'multipart/form-data']); ?>
<h6 class="panel-title">Add Result</h6>
<div class="row">
<div class="col-lg-12 "style="margin-bottom:15px;">
<input type="text" name="fancy_result" value="" class="form-control"/>
</div>
<div class="col-lg-4">
<button type="submit" class="btn btn-primary btn-block" style="font-size: 17px;"><i class="icon-spinner2 spinner position-left spinner-form hide"></i>Save</button>
</div>
</div>
<?= $this->Form->end() ?>

</div>
</div>

</div>
</div>
</div>


<script
type="text/javascript"
charset="utf8"
src="https://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/jquery.dataTables.min.js"></script>
<script>
$(function() {
$(".table_id").dataTable();
});
</script>