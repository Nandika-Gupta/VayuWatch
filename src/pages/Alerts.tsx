import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Plus, Trash2, AlertTriangle, MapPin, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface City {
  id: string;
  name: string;
  country: string;
}

interface Alert {
  id: string;
  city_id: string;
  threshold_aqi: number;
  alert_type: string;
  enabled: boolean;
  cities?: City;
}

const Alerts = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, loading } = useAuth();
  const queryClient = useQueryClient();
  const [newAlertCity, setNewAlertCity] = useState('');
  const [newAlertThreshold, setNewAlertThreshold] = useState('100');
  const [newAlertType, setNewAlertType] = useState('above');

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please sign in to manage alerts');
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  // Fetch cities
  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cities').select('*').order('name');
      if (error) throw error;
      return data as City[];
    },
  });

  // Fetch user alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('aqi_alerts')
        .select('*, cities(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Alert[];
    },
    enabled: !!user,
  });

  // Create alert mutation
  const createAlert = useMutation({
    mutationFn: async (alertData: { city_id: string; threshold_aqi: number; alert_type: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('aqi_alerts').insert({
        user_id: user.id,
        ...alertData,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert created successfully');
      setNewAlertCity('');
      setNewAlertThreshold('100');
    },
    onError: (error) => {
      toast.error(`Failed to create alert: ${error.message}`);
    },
  });

  // Toggle alert mutation
  const toggleAlert = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase.from('aqi_alerts').update({ enabled }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
    onError: (error) => {
      toast.error(`Failed to update alert: ${error.message}`);
    },
  });

  // Delete alert mutation
  const deleteAlert = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('aqi_alerts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete alert: ${error.message}`);
    },
  });

  // Update preferred city
  const handleSetPreferredCity = async (cityId: string) => {
    const { error } = await updateProfile({ preferred_city_id: cityId });
    if (error) {
      toast.error('Failed to update preferred city');
    } else {
      toast.success('Preferred city updated!');
    }
  };

  const handleCreateAlert = () => {
    if (!newAlertCity) {
      toast.error('Please select a city');
      return;
    }
    createAlert.mutate({
      city_id: newAlertCity,
      threshold_aqi: parseInt(newAlertThreshold),
      alert_type: newAlertType,
    });
  };

  const getAlertDescription = (type: string, threshold: number) => {
    if (type === 'above') {
      return `When AQI goes above ${threshold}`;
    }
    return `When AQI goes below ${threshold}`;
  };

  const preferredCity = cities?.find(c => c.id === profile?.preferred_city_id);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Set up AQI alerts for your favorite cities
          </p>
        </div>

        {/* Preferred City Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              My City
            </CardTitle>
            <CardDescription>
              Set your preferred city to see it first on the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {citiesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="flex items-center gap-4">
                <Select
                  value={profile?.preferred_city_id || ''}
                  onValueChange={handleSetPreferredCity}
                >
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {city.name}, {city.country}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {preferredCity && (
                  <p className="text-sm text-muted-foreground">
                    Currently: <span className="font-medium text-foreground">{preferredCity.name}</span>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create New Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Alert
            </CardTitle>
            <CardDescription>
              Get notified when air quality changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Select value={newAlertCity} onValueChange={setNewAlertCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={newAlertType} onValueChange={setNewAlertType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">AQI goes above</SelectItem>
                    <SelectItem value="below">AQI goes below</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Threshold AQI</Label>
                <Input
                  type="number"
                  value={newAlertThreshold}
                  onChange={(e) => setNewAlertThreshold(e.target.value)}
                  min="0"
                  max="500"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreateAlert} disabled={createAlert.isPending} className="w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
            <CardDescription>
              {alerts?.length || 0} alert{alerts?.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !alerts?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No alerts configured yet</p>
                <p className="text-sm">Create your first alert above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={alert.enabled}
                        onCheckedChange={(enabled) =>
                          toggleAlert.mutate({ id: alert.id, enabled })
                        }
                      />
                      <div>
                        <p className="font-medium text-foreground">
                          {alert.cities?.name || 'Unknown City'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getAlertDescription(alert.alert_type, alert.threshold_aqi)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAlert.mutate(alert.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Alerts;
