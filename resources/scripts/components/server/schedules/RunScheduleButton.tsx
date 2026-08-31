import React, { useCallback, useEffect, useRef, useState } from 'react';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Button } from '@/components/elements/button/index';
import triggerScheduleExecution from '@/api/server/schedules/triggerScheduleExecution';
import getServerSchedule from '@/api/server/schedules/getServerSchedule';
import { ServerContext } from '@/state/server';
import useFlash from '@/plugins/useFlash';
import { Schedule } from '@/api/server/schedules/getServerSchedules';

const POLL_INTERVAL = 3000;
const MAX_POLL_ATTEMPTS = 40;
const MAX_CONSECUTIVE_FAILURES = 3;
const MAX_POLL_DURATION = 2 * 60 * 1000;

const RunScheduleButton = ({ schedule }: { schedule: Schedule }) => {
    const [loading, setLoading] = useState(false);
    const [pollFailed, setPollFailed] = useState(false);
    const [pollCycle, setPollCycle] = useState(0);
    const pollGeneration = useRef(0);
    const pollTimeout = useRef<number>();
    const { addError, clearFlashes, clearAndAddHttpError } = useFlash();

    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const appendSchedule = ServerContext.useStoreActions((actions) => actions.schedules.appendSchedule);

    useEffect(() => {
        const generation = ++pollGeneration.current;
        window.clearTimeout(pollTimeout.current);

        if (!schedule.isProcessing) {
            setPollFailed(false);
            return;
        }

        let attempts = 0;
        let consecutiveFailures = 0;
        const startedAt = Date.now();

        const stopPolling = (message: string) => {
            if (pollGeneration.current !== generation) return;

            setPollFailed(true);
            addError({ key: 'schedules', message });
        };

        const poll = () => {
            pollTimeout.current = window.setTimeout(() => {
                getServerSchedule(uuid, schedule.id)
                    .then((updated) => {
                        if (pollGeneration.current !== generation) return;

                        consecutiveFailures = 0;
                        appendSchedule(updated);
                        if (!updated.isProcessing) {
                            setPollFailed(false);
                            return;
                        }

                        attempts += 1;
                        if (attempts >= MAX_POLL_ATTEMPTS || Date.now() - startedAt >= MAX_POLL_DURATION) {
                            stopPolling(
                                'Schedule status is taking longer than expected. Refresh its status to continue.'
                            );
                            return;
                        }

                        poll();
                    })
                    .catch((error) => {
                        if (pollGeneration.current !== generation) return;

                        attempts += 1;
                        consecutiveFailures += 1;
                        if (
                            attempts >= MAX_POLL_ATTEMPTS ||
                            consecutiveFailures >= MAX_CONSECUTIVE_FAILURES ||
                            Date.now() - startedAt >= MAX_POLL_DURATION
                        ) {
                            console.error(error);
                            stopPolling(
                                'Schedule status could not be refreshed. Retry when the connection is available.'
                            );
                            return;
                        }

                        poll();
                    });
            }, POLL_INTERVAL);
        };

        poll();

        return () => {
            if (pollGeneration.current === generation) pollGeneration.current += 1;
            window.clearTimeout(pollTimeout.current);
        };
    }, [uuid, schedule.id, schedule.isProcessing, pollCycle]);

    const refreshStatus = useCallback(() => {
        clearFlashes('schedules');
        setLoading(true);
        setPollFailed(false);

        getServerSchedule(uuid, schedule.id)
            .then((updated) => {
                appendSchedule(updated);
                if (updated.isProcessing) setPollCycle((value) => value + 1);
            })
            .catch((error) => {
                console.error(error);
                setPollFailed(true);
                clearAndAddHttpError({ error, key: 'schedules' });
            })
            .finally(() => setLoading(false));
    }, [appendSchedule, clearAndAddHttpError, clearFlashes, schedule.id, uuid]);

    const onTriggerExecute = useCallback(() => {
        if (schedule.isProcessing) {
            refreshStatus();
            return;
        }

        clearFlashes('schedules');
        setLoading(true);
        triggerScheduleExecution(id, schedule.id)
            .then(() => {
                setPollFailed(false);
                appendSchedule({ ...schedule, isProcessing: true });
            })
            .catch((error) => {
                console.error(error);
                clearAndAddHttpError({ error, key: 'schedules' });
            })
            .finally(() => setLoading(false));
    }, [appendSchedule, clearAndAddHttpError, clearFlashes, id, refreshStatus, schedule]);

    return (
        <>
            <SpinnerOverlay visible={loading} size={'large'} />
            <Button
                variant={Button.Variants.Secondary}
                className={'flex-1 sm:flex-none'}
                disabled={loading || (schedule.isProcessing && !pollFailed)}
                onClick={onTriggerExecute}
            >
                {schedule.isProcessing ? (pollFailed ? 'Refresh Status' : 'Processing') : 'Run Now'}
            </Button>
        </>
    );
};

export default RunScheduleButton;
