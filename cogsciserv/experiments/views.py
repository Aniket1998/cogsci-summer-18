from django.shortcuts import render,get_object_or_404,redirect
from .models import Experiment,Response

# Create your views here.
def front_view(request):
	exp_list = Experiment.objects.all()
	return render(request,'experiments/frontpage.html',{'exp_list' : exp_list})

#def exp_view(request,exp_id):
#	exp = get_object_or_404(Experiment,pk=exp_id)
#	return render(request,'experiments/exp' + str(exp_id) + '.html',{'title' : exp.exp_name, 'desc' : exp.exp_desc})

def exp_view(request):
	exp = get_object_or_404(Experiment,pk=request.POST['Experiment'])
	context = {
		'expid' : exp.pk,
		'title' : exp.exp_name,
		'desc' : exp.exp_desc,
		'name' : request.POST['Name'],
		'roll' : request.POST['RollNo'],
		'age' : request.POST['Age'],
		'gender' : request.POST['Gender']
	}
	return render(request,'experiments/exp' + str(request.POST['Experiment']) + '.html',context)

def submit_view(request):
	exp = get_object_or_404(Experiment,pk=request.POST['expid'])
	exp.response_set.create(name = request.POST['Name'],roll = request.POST['RollNo'],gender = request.POST['Gender'],
		age = request.POST['Age'],resp = request.POST['Response'])
	return redirect('/exp/' + str(exp.pk) + '/data/')

def data_view(request,exp_id):
	exp = get_object_or_404(Experiment,pk=exp_id)
	return render(request,'experiments/resultspage.html',{'name' : exp.exp_name,'response_list' : exp.response_set.all()})
